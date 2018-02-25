// копия из resize-observer-polyfill

declare class DOMRectReadOnly {
    +x: number;
    +y: number;
    +width: number;
    +height: number;
    +top: number;
    +right: number;
    +bottom: number;
    +left: number;
}

declare class ResizeObserverEntry {
    +target: Element;
    +contentRect: DOMRectReadOnly;
}

declare type ResizeObserverEntries = $ReadOnlyArray<ResizeObserverEntry>;

declare type ResizeObserverCallback = {
    (entries: ResizeObserverEntries, observer: ResizeObserver): void
};

declare class ResizeObserver {
    constructor(ResizeObserverCallback): ResizeObserver;
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
}
