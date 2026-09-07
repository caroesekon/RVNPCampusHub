const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#[\w]+/g) || [];
  return [...new Set(matches.map((tag) => tag.replace('#', '').toLowerCase()))];
};

const extractMentions = (text) => {
  if (!text) return [];
  const matches = text.match(/@[\w]+/g) || [];
  return [...new Set(matches.map((mention) => mention.replace('@', '')))];
};

const parseContent = (text) => {
  return {
    text,
    hashtags: extractHashtags(text),
    mentions: extractMentions(text),
  };
};

const renderTextWithLinks = (text, hashtags = [], mentions = []) => {
  if (!text) return text;

  let rendered = text;

  hashtags.forEach((tag) => {
    const regex = new RegExp(`#${tag}`, 'gi');
    rendered = rendered.replace(regex, `__HASHTAG__${tag}__END__`);
  });

  mentions.forEach((mention) => {
    const regex = new RegExp(`@${mention.fullName}`, 'gi');
    rendered = rendered.replace(regex, `__MENTION__${mention.userId}__${mention.fullName}__END__`);
  });

  return rendered;
};

export {
  extractHashtags,
  extractMentions,
  parseContent,
  renderTextWithLinks,
};