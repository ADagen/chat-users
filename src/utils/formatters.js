// @flow

export function dateFormatter(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}
