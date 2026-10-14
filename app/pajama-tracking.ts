export type FaceOpening = {
  x: number; y: number; width: number; height: number;
  outline: [number, number][];
};

// Track the flat grey-green openings in the original footage, before portraits
// are composited. Coordinates are normalized, so the probe can stay small.
export function findPajamaFaces(data: Uint8ClampedArray, width: number, height: number): FaceOpening[] {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) {
    const p = i * 4, r = data[p], g = data[p + 1], b = data[p + 2];
    mask[i] = Number(data[p + 3] > 128 && r > 65 && r < 175 && g > 85 && g < 180 && b > 80 && b < 175 && g - r > 5 && g - r < 40 && Math.abs(g - b) < 25);
  }
  const queue = new Int32Array(mask.length), faces: FaceOpening[] = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start]) continue;
    let count = 1, head = 0, left = width, top = height, right = 0, bottom = 0;
    queue[0] = start; mask[start] = 0;
    const rows = new Map<number, [number, number]>();
    while (head < count) {
      const i = queue[head++], x = i % width, y = Math.floor(i / width);
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      const row = rows.get(y); rows.set(y, row ? [Math.min(row[0], x), Math.max(row[1], x)] : [x, x]);
      for (const next of [x > 0 ? i - 1 : -1, x + 1 < width ? i + 1 : -1, y > 0 ? i - width : -1, y + 1 < height ? i + width : -1]) {
        if (next >= 0 && mask[next]) { mask[next] = 0; queue[count++] = next; }
      }
    }
    const w = right - left + 1, h = bottom - top + 1, area = w * h;
    if (w < width * .025 || h < height * .04 || w > width * .38 || h > height * .6 || w / h < .55 || w / h > 1.8 || count / area < .48 || left === 0 || right === width - 1 || top === 0 || bottom === height - 1) continue;
    const outline: [number, number][] = [];
    // Include the spaces occupied by the original eyes/mouth, preserving only
    // the silhouette of the hood opening, rather than holes through the photo.
    for (let y = top; y <= bottom; y++) { const row = rows.get(y); if (row) outline.push([row[0] / width, y / height]); }
    for (let y = bottom; y >= top; y--) { const row = rows.get(y); if (row) outline.push([(row[1] + 1) / width, (y + 1) / height]); }
    faces.push({ x: left / width, y: top / height, width: w / width, height: h / height, outline });
  }
  return faces.sort((a, b) => b.width * b.height - a.width * a.height).slice(0, 4).sort((a, b) => a.x - b.x);
}

export function matchPajamaFaces(previous: (FaceOpening | null)[], detected: FaceOpening[]): (FaceOpening | null)[] {
  if (!previous.some(Boolean)) return Array.from({ length: 4 }, (_, i) => detected[i] || null);
  const result: (FaceOpening | null)[] = [null, null, null, null];
  const used = new Set<number>();
  const pairs = previous.flatMap((old, slot) => old ? detected.map((face, index) => {
    const distance = Math.hypot(face.x + face.width / 2 - old.x - old.width / 2, face.y + face.height / 2 - old.y - old.height / 2);
    const sizeRatio = (face.width * face.height) / (old.width * old.height);
    return { slot, index, distance, cost: distance + Math.abs(Math.log(sizeRatio)) * .03, valid: distance < Math.max(.08, old.width * .7) && sizeRatio > .4 && sizeRatio < 2.5 };
  }) : []).filter(pair => pair.valid).sort((a, b) => a.cost - b.cost);
  for (const pair of pairs) if (!result[pair.slot] && !used.has(pair.index)) { result[pair.slot] = detected[pair.index]; used.add(pair.index); }
  return result;
}
