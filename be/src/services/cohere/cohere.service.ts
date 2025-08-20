import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { filterInputForCohere } from './logic/filter-input';
import { buildCohereDocuments } from './logic/build-documents';
import { fetchDetailedGroups } from './logic/fetch-group-detail';
import axios from 'axios';
import { BaiDangService } from 'src/modules/baidang/baidang.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CohereService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly baiDangService: BaiDangService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * ********** SERVICE **********
   * SERVICE đề xuất khóa học, nhóm bằng embed
   */

  // hàm sử dụng embed thay vì rerank
  private async rankWithCohere(query: string, documents: any[]) {
    if (documents.length === 0) {
      return [];
    }

    // Tạo embeddings cho query và tất cả documents
    const allTexts = [query, ...documents.map((d) => d.text)];

    const response = await axios.post(
      this.configService.get('COHERE_EMBED_URL') ||
        'https://api.cohere.ai/v2/embed',
      {
        model: 'embed-multilingual-v3.0',
        texts: allTexts,
        input_type: 'search_document',
        embedding_types: ['float'],
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get('COHERE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const embeddings =
      response.data.embeddings?.float || response.data.embeddings;
    const queryEmbedding = embeddings[0]; //query
    const docEmbeddings = embeddings.slice(1); // documents

    const results = docEmbeddings.map((docEmb, index) => ({
      ...documents[index],
      relevance: this.cosineSimilarity(queryEmbedding, docEmb),
    }));

    // Sắp xếp theo độ tương đồng giảm dần và lấy top 10
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  // Hàm tính cosine similarity
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const lengthA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const lengthB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    return dotProduct / (lengthA * lengthB);
  }

  // SERVICE: Lấy khóa học đề xuất
  async getRecommendedCourses(name: string, maNguoiDung: string) {
    const khoaHocs = await this.dataSource.query(
      `
        SELECT kh.* 
        FROM "KHOAHOC" kh
        WHERE kh."deletedAt" IS NULL
      `,
    );

    const filteredCourses = await filterInputForCohere(
      this.dataSource,
      khoaHocs,
      maNguoiDung,
      'khoahoc',
    );

    const documents = buildCohereDocuments(filteredCourses, 'khoahoc');
    const ranked = await this.rankWithCohere(name, documents);
    const khoaHocRaw = ranked
      .filter((r) => r.relevance > 0.5)
      .slice(0, 4)
      .map((r) => r.meta);

    return { khoaHoc: khoaHocRaw };
  }

  // SERVICE: Lấy nhóm học tập đề xuất
  async getRecommendedGroups(name: string, maNguoiDung: string) {
    const nhomHocTaps = await this.dataSource.query(
      `
        SELECT nh.* 
        FROM "NHOMHOCTAP" nh
        WHERE nh."deletedAt" IS NULL
      `,
    );

    const filteredGroups = await filterInputForCohere(
      this.dataSource,
      nhomHocTaps,
      maNguoiDung,
      'nhomhoctap',
    );

    const documents = buildCohereDocuments(filteredGroups, 'nhomhoctap');
    const ranked = await this.rankWithCohere(name, documents);
    const nhomHocTapRaw = ranked
      .filter((r) => r.relevance > 0.7)
      .slice(0, 3)
      .map((r) => r.meta);

    if (!nhomHocTapRaw.length) {
      return { nhomHocTap: [] };
    }
    const nhomChiTiet = await fetchDetailedGroups(
      this.dataSource,
      nhomHocTapRaw,
    );

    return { nhomHocTap: nhomChiTiet };
  }

  /**
   * ********** SERVICE **********
   * SERVICE phân loại bài đăng theo danh mục sử dụng classify
   */
  private async classifyWithCohere(texts: string[]) {
    if (texts.length === 0) {
      return [];
    }
    const response = await axios.post(
      this.configService.get('COHERE_CLASSIFY_API') ||
        'https://api.cohere.com/v1/classify',
      {
        model: this.configService.get('COHERE_CLASSIFY_MODEL'),
        inputs: texts,
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get('COHERE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.classifications;
  }

  // SERVICE: phân loại bài đăng theo danh mục sử dụng classify
  async classifyBlogs() {
    const cacheKey = 'classified_blogs';
    const cachedResult = await this.redisService.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const allBlogs = await this.baiDangService.getAllBlog();
    const blogDocuments = buildCohereDocuments(allBlogs, 'baidang');
    const categories = [
      'giải tích',
      'đại số tuyến tính',
      'xác suất thống kê',
      'kinh tế lượng',
    ];
    const classifications = await this.classifyWithCohere(
      blogDocuments.map((doc) => doc.text),
    );

    const result = {};
    categories.forEach((category) => {
      result[category] = [];
    });

    classifications.forEach((classification, index) => {
      const category = classification.prediction;
      const confidence = classification.confidence;

      if (confidence > 0.6 && result[category].length < 5) {
        result[category].push(blogDocuments[index].meta);
      }
    });

    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }
}
