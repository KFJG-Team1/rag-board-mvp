type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-bar">
      검색
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="제목, 내용, 작성자, 태그 검색"
      />
    </label>
  );
}
