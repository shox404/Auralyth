export const LearnLanguage = (prompt: string) => {
  return `Generate a Mermaid mindmap using 'graph TD' for the following topic as a structured learning path.
          Output only the graph code, nothing else.
          Data should be only about language.
          Show graph TD; A[topic] variables than at the end directions like A --> B.
          Topic: ${prompt} basics`.trim();
};

export const AboutTheme = (prompt: string) => {
  return `Brief information about ${prompt}.
          One example code`.trim();
};
