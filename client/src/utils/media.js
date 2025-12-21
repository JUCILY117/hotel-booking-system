export function resolveMediaUrl(path) {
    if (!path) return null;

    if (path.startsWith("http")) {
        return path;
    }

    return `${import.meta.env.VITE_API_BASE_URL}${path}`;
}