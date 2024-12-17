/**
 * Backlog APIクライアント
 * @module BacklogApiClient
 */

// 設定インターフェース
export interface BacklogConfig {
  baseUrl: string;
  apiKey: string;
  wikiId: string;
}

// APIレスポンスの型定義
interface WikiResponse {
  id: number;
  projectId: number;
  name: string;
  content: string;
  tags: string[];
  attachments: any[];
  sharedFiles: any[];
  stars: any[];
  created: string;
  updated: string;
}

export class BacklogApiClient {
  private config: BacklogConfig;

  constructor(config: BacklogConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  /**
   * 設定値のバリデーション
   * @param {BacklogConfig} config - 設定オブジェクト
   * @throws {Error} バリデーションエラー
   */
  private validateConfig(config: BacklogConfig): void {
    if (!config.baseUrl || !config.baseUrl.startsWith('http')) {
      throw new Error('無効なURLです。httpsから始まるURLを入力してください。');
    }
    if (!config.apiKey || config.apiKey.length < 24) {
      throw new Error('無効なAPIキーです。24文字以上の文字列を入力してください。');
    }
    if (!config.wikiId || isNaN(Number(config.wikiId))) {
      throw new Error('無効なWiki IDです。数値を入力してください。');
    }
  }

  /**
   * Wikiページを取得
   * @returns {Promise<WikiResponse>} Wikiページ情報
   * @throws {Error} API呼び出しエラー
   */
  async getWiki(): Promise<WikiResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v2/wikis/${this.config.wikiId}?apiKey=${this.config.apiKey}`
      );
      if (!response.ok) {
        throw new Error(`Wiki取得エラー: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Wiki取得中にエラーが発生:', error);
      throw error;
    }
  }

  /**
   * Wikiページを更新
   * @param {string} name - Wiki名
   * @param {string} content - Wiki内容
   * @returns {Promise<WikiResponse>} 更新結果
   * @throws {Error} API呼び出しエラー
   */
  async updateWiki(name: string, content: string): Promise<WikiResponse> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('content', content);
      formData.append('mailNotify', 'false');

      const response = await fetch(
        `${this.config.baseUrl}/api/v2/wikis/${this.config.wikiId}?apiKey=${this.config.apiKey}`,
        {
          method: 'PATCH',
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error(`Wiki更新エラー: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Wiki更新中にエラーが発生:', error);
      throw error;
    }
  }

  /**
   * ファイルを添付
   * @param {string} svgContent - SVG内容
   * @param {string} fileName - ファイル名
   * @returns {Promise<string>} 添付ファイルID
   * @throws {Error} ファイル添付エラー
   */
  async attachFile(svgContent: string, fileName: string): Promise<string> {
    try {
      // 添付ファイル登録
      const formData = new FormData();
      formData.append('file', new Blob([svgContent], { type: 'image/svg+xml' }), fileName);

      const attachResponse = await fetch(
        `${this.config.baseUrl}/api/v2/space/attachment?apiKey=${this.config.apiKey}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!attachResponse.ok) {
        throw new Error(`ファイル添付エラー: ${attachResponse.status}`);
      }

      const attachResult = await attachResponse.json();

      // Wikiに添付
      const wikiAttachFormData = new FormData();
      const wikiAttachResponse = await fetch(
        `${this.config.baseUrl}/api/v2/wikis/${this.config.wikiId}/attachments?apiKey=${this.config.apiKey}&attachmentId[]=${attachResult.id}`,
        {
          method: 'POST',
          body: wikiAttachFormData,
        }
      );

      if (!wikiAttachResponse.ok) {
        throw new Error(`Wiki添付エラー: ${wikiAttachResponse.status}`);
      }

      const wikiAttachResult = await wikiAttachResponse.json();
      return wikiAttachResult[0].id;
    } catch (error) {
      console.error('ファイル添付中にエラーが発生:', error);
      throw error;
    }
  }
}