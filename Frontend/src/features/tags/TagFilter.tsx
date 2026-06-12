type TagFilterProps = {
  tags: string[];
  selectedTag: string;
  onSelect: (tag: string) => void;
};

export function TagFilter({ tags, selectedTag, onSelect }: TagFilterProps) {
  return (
    <section className="tag-filter" aria-label="태그 필터">
      <button
        className={selectedTag === "" ? "active" : ""}
        type="button"
        onClick={() => onSelect("")}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          className={selectedTag === tag ? "active" : ""}
          type="button"
          key={tag}
          onClick={() => onSelect(tag)}
        >
          #{tag}
        </button>
      ))}
    </section>
  );
}
