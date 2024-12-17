/**
 * Mermaid図の生成と管理
 * @module MermaidService
 */
import mermaid from 'mermaid';

export class MermaidService {
  constructor() {
    // Mermaidの初期化設定
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'strict' // セキュリティレベルの設定
    });
  }

  /**
   * Mermaid図をSVGとしてレンダリング
   * @param {string} content - Mermaidコード
   * @returns {Promise<string>} SVG文字列
   * @throws {Error} レンダリングエラー
   */
  async renderDiagram(content: string): Promise<string> {
    try {
      // 入力値の検証
      if (!content || content.trim().length === 0) {
        throw new Error('Mermaidコードが空です');
      }

      // SVGの生成
      const { svg } = await mermaid.render('mermaidDiagram', content);

      // SVGの検証
      if (!svg || svg.trim().length === 0) {
        throw new Error('SVGの生成に失敗しました');
      }

      return svg;
    } catch (error) {
      console.error('Mermaid描画中にエラーが発生:', error);
      throw new Error(`Mermaid描画エラー: ${error}`);
    }
  }
}