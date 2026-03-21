import { useState } from "react";

const products = [
  {
    id: 1,
    brand: "SMEG",
    name: "Coffee Machine",
    price: 985.99,
    originalPrice: 1056.0,
    rating: 5.0,
    sale: "15%",
    liked: false,
    category: "Kitchen",
    img: "https://images.unsplash.com/photo-1570486916327-6b5f4d6a67d0?w=300&q=80",
  },
  {
    id: 2,
    brand: "APPLE",
    name: "iPhone 16 Pro 128GB",
    price: 1130.0,
    originalPrice: null,
    rating: 4.8,
    sale: null,
    liked: false,
    category: "Smartphones",
    img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&q=80",
  },
  {
    id: 3,
    brand: "SMEG",
    name: "Microwave oven",
    price: 129.0,
    originalPrice: null,
    rating: 4.9,
    sale: null,
    liked: false,
    category: "Kitchen",
    img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&q=80",
  },
  {
    id: 4,
    brand: "SMEG",
    name: "Electric Kettle",
    price: 219.99,
    originalPrice: 244.0,
    rating: 4.7,
    sale: "10%",
    liked: false,
    category: "Kitchen",
    img: "https://images.unsplash.com/photo-1612963892401-eb4a3e30e17e?w=300&q=80",
  },
  {
    id: 5,
    brand: "REMEZ",
    name: "Garment Steamer",
    price: 89.99,
    originalPrice: 105.0,
    rating: 4.6,
    sale: "15%",
    liked: false,
    category: "Kitchen",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
  },
  {
    id: 6,
    brand: "APPLE",
    name: "AirPods Max",
    price: 549.0,
    originalPrice: null,
    rating: 4.9,
    sale: null,
    liked: true,
    category: "Smartphones",
    img: "https://images.unsplash.com/photo-1625272249457-e1f3c9e13b7a?w=300&q=80",
  },
];

const brands = ["Apple", "LG", "KitchenAid", "SMEG", "Samsung", "Sony", "Remez"];
const categories = ["All items", "Smartphones", "Kitchen", "Game Console"];
const navLinks = ["Bestsellers", "Sale", "New Arrivals"];
const activeFilters = ["Apple", "SMEG", "Remez", "Home Appliances", "Kitchen Appliances"];

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="#FFD700">
    <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625L4.5 7.07 2 4.635l3.455-.505z" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#ffffff" : "none"} stroke="#fff" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function ProtechBestsellers() {
  const [activeCategory, setActiveCategory] = useState("All items");
  const [likedProducts, setLikedProducts] = useState({ 6: true });
  const [checkedBrands, setCheckedBrands] = useState({ Apple: true, SMEG: true, Remez: true });
  const [brandSearch, setBrandSearch] = useState("");
  const [brandOpen, setBrandOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(false);
  const [filters, setFilters] = useState(activeFilters);

  const toggleLike = (id) => setLikedProducts((p) => ({ ...p, [id]: !p[id] }));
  const toggleBrand = (b) => setCheckedBrands((p) => ({ ...p, [b]: !p[b] }));
  const removeFilter = (f) => setFilters((p) => p.filter((x) => x !== f));

  const filtered = products.filter(
    (p) => activeCategory === "All items" || p.category === activeCategory
  );

  return (
    <div style={styles.root}>
      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <span style={styles.logo}>Protech</span>
          <button style={styles.catalogBtn}>
            <MenuIcon /> <span>Catalog</span>
          </button>
          {navLinks.map((l) => (
            <a key={l} style={{ ...styles.navLink, ...(l === "Bestsellers" ? styles.navLinkActive : {}) }}>
              {l}
            </a>
          ))}
        </div>
        <div style={styles.navRight}>
          <button style={styles.iconBtn}><SearchIcon /></button>
          <button style={styles.iconBtn}><CartIcon /><span style={styles.iconLabel}>Cart</span></button>
          <button style={styles.iconBtn}><UserIcon /><span style={styles.iconLabel}>Log in</span></button>
        </div>
      </nav>

      <div style={styles.body}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          {/* Reset */}
          <button style={styles.resetBtn} onClick={() => setFilters([])}>
            <span style={styles.resetX}>✕</span> Reset filters
          </button>

          {/* Active filter chips */}
          <div style={styles.chips}>
            {filters.map((f) => (
              <span key={f} style={styles.chip}>
                {f}
                <button style={styles.chipX} onClick={() => removeFilter(f)}>✕</button>
              </span>
            ))}
          </div>

          {/* Price */}
          <div style={styles.filterSection}>
            <button style={styles.filterHeader} onClick={() => setPriceOpen((o) => !o)}>
              <span style={styles.filterTitle}>Price</span>
              {priceOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {priceOpen && (
              <div style={{ padding: "12px 0", color: "#888", fontSize: 13 }}>
                Price range slider placeholder
              </div>
            )}
          </div>

          {/* Brand */}
          <div style={styles.filterSection}>
            <button style={styles.filterHeader} onClick={() => setBrandOpen((o) => !o)}>
              <span style={styles.filterTitle}>Brand</span>
              {brandOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {brandOpen && (
              <>
                <div style={styles.brandSearch}>
                  <SearchIcon />
                  <input
                    style={styles.brandInput}
                    placeholder="Search brands"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />
                </div>
                <div style={styles.brandList}>
                  {brands
                    .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
                    .map((b) => (
                      <label key={b} style={styles.brandRow}>
                        <div
                          style={{
                            ...styles.checkbox,
                            ...(checkedBrands[b] ? styles.checkboxChecked : {}),
                          }}
                          onClick={() => toggleBrand(b)}
                        >
                          {checkedBrands[b] && <span style={styles.checkmark}>✓</span>}
                        </div>
                        <span style={styles.brandLabel}>{b}</span>
                      </label>
                    ))}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          <h1 style={styles.heading}>Bestsellers</h1>
          <div style={styles.breadcrumb}>
            <span style={styles.breadHome}>Home</span>
            <span style={styles.breadSep}>›</span>
            <span>Bestsellers</span>
          </div>

          {/* Category tabs + Sort */}
          <div style={styles.toolbar}>
            <div style={styles.tabs}>
              {categories.map((c) => (
                <button
                  key={c}
                  style={{
                    ...styles.tab,
                    ...(activeCategory === c ? styles.tabActive : {}),
                  }}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <button style={styles.sortBtn}>
              <FilterIcon /> Top rated
            </button>
          </div>

          {/* Product grid */}
          <div style={styles.grid}>
            {filtered.map((p) => (
              <div key={p.id} style={styles.card}>
                <div style={styles.cardImgWrap}>
                  {p.sale && <span style={styles.saleBadge}>Sale {p.sale}</span>}
                  <button style={styles.likeBtn} onClick={() => toggleLike(p.id)}>
                    <HeartIcon filled={!!likedProducts[p.id]} />
                  </button>
                  <img src={p.img} alt={p.name} style={styles.cardImg} />
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardMeta}>
                    <span style={styles.cardBrand}>{p.brand}</span>
                    <span style={styles.cardRating}>
                      <StarIcon /> {p.rating.toFixed(1)}
                    </span>
                  </div>
                  <div style={styles.cardPriceRow}>
                    <span style={styles.cardPrice}>${p.price.toFixed(2)}</span>
                    {p.originalPrice && (
                      <span style={styles.cardOriginal}>${p.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <p style={styles.cardName}>{p.name}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    background: "#111",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: 64,
    background: "#111",
    borderBottom: "1px solid #222",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navLeft: { display: "flex", alignItems: "center", gap: 28 },
  logo: { fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "#fff" },
  catalogBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#1e1e1e", border: "1px solid #2a2a2a",
    color: "#fff", borderRadius: 20, padding: "8px 16px",
    cursor: "pointer", fontSize: 14, fontWeight: 500,
  },
  navLink: { color: "#888", textDecoration: "none", fontSize: 14, cursor: "pointer", fontWeight: 500 },
  navLinkActive: { color: "#c8f400" },
  navRight: { display: "flex", alignItems: "center", gap: 20 },
  iconBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "none", border: "none", color: "#ccc",
    cursor: "pointer", fontSize: 14,
  },
  iconLabel: { fontWeight: 500 },
  body: { display: "flex", flex: 1 },
  sidebar: {
    width: 240, padding: "28px 20px",
    borderRight: "1px solid #1e1e1e", flexShrink: 0,
  },
  resetBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "none", border: "none", color: "#fff",
    cursor: "pointer", fontSize: 14, fontWeight: 500,
    marginBottom: 16, padding: 0,
  },
  resetX: {
    width: 22, height: 22, borderRadius: "50%",
    border: "1px solid #444", display: "inline-flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 11, color: "#aaa",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  chip: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#1a1a1a", border: "1px solid #2e2e2e",
    borderRadius: 20, padding: "5px 12px", fontSize: 13, color: "#ddd",
  },
  chipX: {
    background: "none", border: "none", color: "#888",
    cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1,
  },
  filterSection: { borderTop: "1px solid #1e1e1e", paddingTop: 16, marginTop: 4, marginBottom: 4 },
  filterHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", width: "100%",
    background: "none", border: "none", color: "#fff",
    cursor: "pointer", padding: "0 0 12px", fontSize: 15,
  },
  filterTitle: { fontWeight: 600 },
  brandSearch: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#1a1a1a", borderRadius: 8,
    padding: "8px 12px", marginBottom: 12, color: "#666",
  },
  brandInput: {
    background: "none", border: "none", color: "#aaa",
    fontSize: 13, outline: "none", width: "100%",
  },
  brandList: { display: "flex", flexDirection: "column", gap: 10 },
  brandRow: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    border: "1.5px solid #444", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  checkboxChecked: { background: "#c8f400", borderColor: "#c8f400" },
  checkmark: { color: "#111", fontSize: 11, fontWeight: 700 },
  brandLabel: { fontSize: 13.5, color: "#ccc" },
  main: { flex: 1, padding: "28px 32px" },
  heading: { fontSize: 42, fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 6px" },
  breadcrumb: { fontSize: 13, color: "#555", marginBottom: 24, display: "flex", gap: 6 },
  breadHome: { cursor: "pointer", color: "#555" },
  breadSep: { color: "#333" },
  toolbar: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  tabs: { display: "flex", gap: 4 },
  tab: {
    background: "none", border: "none",
    color: "#666", cursor: "pointer", fontSize: 14,
    fontWeight: 500, padding: "8px 16px", borderRadius: 6,
    transition: "color 0.2s",
  },
  tabActive: {
    color: "#fff", borderBottom: "2px solid #c8f400",
    borderRadius: 0,
  },
  sortBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#1a1a1a", border: "1px solid #2a2a2a",
    color: "#fff", borderRadius: 20, padding: "8px 18px",
    cursor: "pointer", fontSize: 13, fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#181818", borderRadius: 16,
    overflow: "hidden", transition: "transform 0.2s",
    cursor: "pointer",
  },
  cardImgWrap: {
    position: "relative", background: "#1e1e1e",
    height: 220, display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  saleBadge: {
    position: "absolute", top: 12, left: 12,
    background: "#c8f400", color: "#111",
    fontWeight: 700, fontSize: 12,
    borderRadius: 6, padding: "3px 10px",
  },
  likeBtn: {
    position: "absolute", top: 10, right: 10,
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  cardImg: {
    maxHeight: "80%", maxWidth: "80%",
    objectFit: "contain",
  },
  cardBody: { padding: "14px 16px 18px" },
  cardMeta: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  cardBrand: { fontSize: 11, letterSpacing: "0.06em", color: "#666", fontWeight: 600 },
  cardRating: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 13, color: "#ccc",
  },
  cardPriceRow: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 },
  cardPrice: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" },
  cardOriginal: { fontSize: 13, color: "#555", textDecoration: "line-through" },
  cardName: { fontSize: 13, color: "#888", margin: 0 },
};
