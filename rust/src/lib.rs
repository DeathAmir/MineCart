use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn score_project(query: &str, title: &str, summary: &str, category: &str, loader: &str) -> u32 {
    let needle = normalize(query);
    if needle.is_empty() { return 1; }
    let title = normalize(title);
    let summary = normalize(summary);
    let category = normalize(category);
    let loader = normalize(loader);
    if title == needle { return 1000; }
    if title.starts_with(&needle) { return 850; }
    if title.split_whitespace().any(|word| word.starts_with(&needle)) { return 700; }
    if title.contains(&needle) { return 600; }
    if category.contains(&needle) || loader.contains(&needle) { return 450; }
    if summary.contains(&needle) { return 300; }
    let mut score = 0u32;
    let mut cursor = 0usize;
    for ch in needle.chars() {
        if let Some(offset) = title[cursor..].find(ch) {
            score += 8u32.saturating_sub(offset.min(7) as u32);
            cursor += offset + ch.len_utf8();
        } else { return 0; }
    }
    score
}

fn normalize(value: &str) -> String { value.trim().to_lowercase() }
