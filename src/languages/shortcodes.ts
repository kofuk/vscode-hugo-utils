export type Shortcode = {
  doc?: string;
  args?: string[];
  unnamedArgs?: boolean;
  deprecated?: string;
  removed?: string;
};

export const EMBEDDED_SHORTCODES: Readonly<Record<string, Shortcode>> = {
  comment: {
    args: [],
    deprecated: 'v0.143.0'
  },
  details: {
    doc: 'Renders an HTML details element.',
    args: ['class', 'name', 'summary', 'title', 'open']
  },
  figure: {
    args: ['src', 'link', 'target', 'rel', 'alt', 'title', 'caption', 'class', 'height', 'width', 'loading', 'attr', 'attrlink']
  },
  gist: {
    args: ['user', 'id', 'file'],
    unnamedArgs: true,
    deprecated: 'v0.143.0'
  },
  highlight: {
    args: ['lang', 'options'],
    unnamedArgs: true
  },
  instagram: {
    args: ['id']
  },
  instagram_simple: {
    args: ['id'],
    removed: 'v0.123.0'
  },
  param: {
    args: ['name'],
    unnamedArgs: true
  },
  qr: {
    doc: 'Encodes the given text into a QR code using the specified options and renders the resulting image.',
    args: ['text', 'level', 'scale', 'targetDir', 'alt', 'class', 'id', 'title', 'loading']
  },
  ref: {
    args: ['path', 'lang', 'outputFormat']
  },
  relref: {
    args: ['path', 'lang', 'outputFormat']
  },
  twitter: {
    args: ['user', 'id'],
    deprecated: 'v0.142.0'
  },
  tweet: {
    args: ['user', 'id'],
    deprecated: 'v0.142.0'
  },
  twitter_simple: {
    args: ['user', 'id'],
    deprecated: 'v0.142.0'
  },
  vimeo: {
    args: ['class', 'id', 'title'],
    unnamedArgs: true
  },
  vimeo_simple: {
    args: ['class', 'id', 'title'],
    unnamedArgs: true
  },
  x: {
    args: ['user', 'id']
  },
  x_simple: {
    args: ['user', 'id']
  },
  youtube: {
    doc: 'Renders an embedded YouTube video.',
    args: ['allowFullScreen', 'autoplay', 'class', 'controls', 'end', 'id', 'loading', 'loop', 'mute', 'start', 'title']
  }
};
