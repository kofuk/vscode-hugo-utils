export type Shortcode = {
    args?: string[]|null;
    unnamedArgs?: boolean;
};

export const EMBEDDED_SHORTCODES: Readonly<Record<string, Shortcode>> = {
    'figure': {
        args: ['src', 'link', 'target', 'rel', 'alt', 'title', 'caption', 'class', 'height', 'width', 'loading', 'attr', 'attrlink'],
    },
    'gist': {
        args: ['user', 'id', 'file'],
        unnamedArgs: true,
    },
    'highlight': {
        args: ['lang', 'options'],
        unnamedArgs: true,
    },
    'instagram': {
        args: ['id'],
    },
    'param': {
        args: ['name'],
        unnamedArgs: true,
    },
    'ref': {
        args: ['pageRef'],
        unnamedArgs: true,
    },
    'relref': {
        args: ['pageRef'],
        unnamedArgs: true,
    },
    'twitter': {
        args: ['user', 'id'],
    },
    'tweet': {
        args: ['user', 'id'],
    },
    'vimeo': {
        args: ['id'],
        unnamedArgs: true,
    },
    'youtube': {
        args: ['id', 'allowFullScreen', 'autoplay', 'class', 'controls', 'end', 'loading', 'loop', 'mute', 'start', 'title'],
    },
};
