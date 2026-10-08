import OpenAI from 'openai';
import settings from '../../constant/settings';

const client = new OpenAI({
  baseURL: settings.ai.baseURL,
  apiKey: settings.ai.apiKey,
});

const GENERATE_TITLE_SYSTEM_PROMPT = `你是一个专业的内容标题生成助手。你的任务是为文章、教程或技术文档生成简洁、有吸引力的标题，长度控制在15个字以内。

规则：
1. 必须反映内容核心主题
2. 使用动词短语或名词短语
3. 避免使用疑问句和感叹号
4. 优先选择：
   - 技术文章用专业术语
   - 教程用"指南"
   - 经验分享用"实践"
5. 禁止使用"如何"/"怎样"/"教你"等`;

const GENERATE_SUMMARY_SYSTEM_PROMPT = `你是一个专业的内容摘要生成助手。你的任务是为文章生成简洁、有吸引力的摘要，长度控制在100字以内。

# 规则
1. 核心信息
   - 第一句话概括"做了什么"，15字以内
   - 避免套话如"本文介绍了"/教程分享"
   - 直接从实质性内容开始
2. 结构要求：
   - 第一句：核心成果/方法 （必须）
   - 第二句：关键技术点/创新点 （必须）
   - 第三句：适用场景/受众 （可选择性省略）

3. 语言风格：
   - 多用短句和数据
   - 突出技术关键词

# 示例
- 正确：使用 Redis 实现分布式锁方案，通过 Lua 脚本确保原子性，支持高并发场景下的资源竞争控制。
- 错误：本文将介绍如何使用 Redis 实现分布式锁。`;

function detectContentType(text: string): string {
  const techKeywords = ['代码', '算法', '架构'];
  const tutorialKeywords = ['教程', '指南', '步骤'];
  return techKeywords.some(k => text.includes(k))
    ? '技术文章'
    : tutorialKeywords.some(k => text.includes(k))
    ? '教程指南'
    : '综合内容';
}

export async function generateTitle(content: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: settings.ai.model,
    messages: [
      { role: 'system', content: GENERATE_TITLE_SYSTEM_PROMPT },
      { role: 'user', content: `请为以下内容生成标题:\n${content}` },
    ],
    temperature: 0.7,
    max_tokens: 50,
  });
  const raw = res.choices[0]?.message?.content || '';
  return raw.replace(/^["']+|["']+$/g, '').trim();
}

export async function generateSummary(content: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: settings.ai.model,
    messages: [
      { role: 'system', content: GENERATE_SUMMARY_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `内容类型：${detectContentType(
          content
        )}\n请生成摘要:\n${content}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
    stop: ['\n\n'],
  });
  const raw = res.choices[0]?.message?.content || '';
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\.(\S)/g, '. $1')
    .replace(/^"|"$/g, '')
    .trim();
}
