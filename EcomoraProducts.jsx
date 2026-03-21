import { useState } from "react";

const products = [
  { id: 1, name: "Front Table CSS", price: 150.50, stock: 544, sold: 256, category: "Furniture", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80" },
  { id: 2, name: "Apple Watch Series 10", price: 160.40, stock: 544, sold: 256, category: "Electronic", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&q=80" },
  { id: 3, name: "Chester Chair", price: 120.30, stock: 544, sold: 256, category: "Furniture", img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300&q=80" },
  { id: 4, name: "Air Wireless Headphone", price: 120.99, stock: 544, sold: 256, category: "Electronic", img: "https://images.unsplash.com/photo-1625272249457-e1f3c9e13b7a?w=300&q=80" },
  { id: 5, name: "Nike Downshifter 12", price: 150.50, stock: 544, sold: 256, category: "Shoes", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80" },
  { id: 6, name: "Apple AirPods", price: 150.50, stock: 544, sold: 256, category: "Electronic", img: "https://images.unsplash.com/photo-1588423771073-b8903febb85b?w=300&q=80" },
  { id: 7, name: "Nike Air Max 90", price: 110.20, stock: 544, sold: 256, category: "Shoes", img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80" },
  { id: 8, name: "Portable Speaker", price: 150.50, stock: 544, sold: 256, category: "Electronic", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&q=80" },
  { id: 9, name: "Home Nebulizer", price: 160.50, stock: 544, sold: 256, category: "Electronic", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80" },
  { id: 10, name: "Elegant Black Perfume", price: 190.40, stock: 544, sold: 256, category: "Grocery", img: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80" },
];

const categories = ["All Products", "Most Purchased", "Furniture", "Shoes", "Clothes", "Electronic", "Sports", "Grocery"];
const navItems = [
  { label: "Dashboard", icon: <GridIcon /> },
  { label: "Products", icon: <BoxIcon />, active: true },
  { label: "Purchases", icon: <CardIcon /> },
  { label: "Customers", icon: <UsersIcon /> },
  { label: "Analytics", icon: <ChartIcon /> },
  { label: "Settings", icon: <SettingsIcon /> },
];

function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function BoxIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
}
function CardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function ArrowIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>;
}
function ChevronIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
}
function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#111"/>
      <path d="M8 18 Q14 6 20 18" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="14" cy="9" r="2" fill="#fff"/>
    </svg>
  );
}

export default function EcomoraProducts() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [activeNav, setActiveNav] = useState("Products");
  const [search, setSearch] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All Products" || activeCategory === "Most Purchased" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={s.root}>
      {/* Watermark background */}
      <div style={s.watermark}>
        <LogoIcon />
        <span style={s.watermarkText}>Ecomora</span>
      </div>

      <div style={s.card}>
        {/* TOP NAV */}
        <nav style={s.nav}>
          <div style={s.navBrand}>
            <LogoIcon />
            <span style={s.brandName}>Ecomora</span>
          </div>
          <div style={s.navLinks}>
            {navItems.map(({ label, icon, active }) => (
              <button
                key={label}
                style={{ ...s.navItem, ...(activeNav === label ? s.navItemActive : {}) }}
                onClick={() => setActiveNav(label)}
              >
                <span style={{ color: activeNav === label ? "#111" : "#888" }}>{icon}</span>
                <span>{label}</span>
                {activeNav === label && <div style={s.navUnderline} />}
              </button>
            ))}
          </div>
          <div style={s.navUser}>
            <img
              src="https://i.pravatar.cc/32?img=12"
              alt="avatar"
              style={s.avatar}
            />
            <span style={s.userName}>Andriano Darwin</span>
            <ChevronIcon />
          </div>
        </nav>

        <div style={s.body}>
          {/* HEADER ROW */}
          <div style={s.headerRow}>
            <h2 style={s.pageTitle}>Products</h2>
            <div style={s.headerActions}>
              <div style={s.searchBox}>
                <SearchIcon />
                <input
                  style={s.searchInput}
                  placeholder="Search product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button style={s.addBtn}>
                <span style={s.addPlus}>+</span> Add New Product
              </button>
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div style={s.tabs}>
            {categories.map((c) => (
              <button
                key={c}
                style={{ ...s.tab, ...(activeCategory === c ? s.tabActive : {}) }}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* PRODUCT GRID */}
          <div style={s.grid}>
            {filtered.map((p) => (
              <div
                key={p.id}
                style={{
                  ...s.productCard,
                  ...(hoveredCard === p.id ? s.productCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(p.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={s.imgWrap}>
                  <img src={p.img} alt={p.name} style={s.productImg} />
                </div>
                <div style={s.productInfo}>
                  <div style={s.productNameRow}>
                    <span style={s.productName}>{p.name}</span>
                  </div>
                  <div style={s.productPriceRow}>
                    <span style={s.productPrice}>${p.price.toFixed(2)}</span>
                    <button style={s.arrowBtn}><ArrowIcon /></button>
                  </div>
                  <div style={s.productMeta}>
                    <span style={s.metaLabel}>Stock: <strong>{p.stock}</strong></span>
                    <span style={s.metaDivider} />
                    <span style={s.metaLabel}>Sold: <strong>{p.sold}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#e8e8e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
    padding: "40px 20px",
    position: "relative",
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -60%)",
    display: "flex",
    alignItems: "center",
    gap: 16,
    opacity: 0.08,
    pointerEvents: "none",
    userSelect: "none",
  },
  watermarkText: {
    fontSize: 120,
    fontWeight: 900,
    color: "#333",
    letterSpacing: "-4px",
    lineHeight: 1,
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    width: "100%",
    maxWidth: 1160,
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    padding: "0 32px",
    height: 68,
    borderBottom: "1px solid #f0f0f0",
    gap: 40,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  brandName: {
    fontWeight: 700,
    fontSize: 17,
    color: "#111",
    letterSpacing: "-0.3px",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "center",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#888",
    padding: "22px 14px",
    position: "relative",
    transition: "color 0.15s",
  },
  navItemActive: {
    color: "#111",
    fontWeight: 600,
  },
  navUnderline: {
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    height: 2.5,
    background: "#111",
    borderRadius: 2,
  },
  navUser: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    cursor: "pointer",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    objectFit: "cover",
  },
  userName: {
    fontSize: 13.5,
    fontWeight: 500,
    color: "#222",
  },
  body: {
    padding: "28px 32px 32px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f7f7f7",
    border: "1px solid #eee",
    borderRadius: 20,
    padding: "8px 16px",
    width: 220,
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: 13.5,
    color: "#555",
    width: "100%",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#fff",
    border: "1.5px solid #ddd",
    borderRadius: 20,
    padding: "8px 20px",
    fontSize: 13.5,
    fontWeight: 500,
    color: "#111",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  addPlus: {
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 300,
  },
  tabs: {
    display: "flex",
    gap: 4,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  tab: {
    background: "none",
    border: "none",
    borderRadius: 20,
    padding: "7px 16px",
    fontSize: 13.5,
    fontWeight: 500,
    color: "#888",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#111",
    color: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
  productCard: {
    background: "#fff",
    border: "1px solid #efefef",
    borderRadius: 16,
    overflow: "hidden",
    transition: "box-shadow 0.2s, transform 0.2s",
    cursor: "pointer",
  },
  productCardHover: {
    boxShadow: "0 6px 24px rgba(0,0,0,0.09)",
    transform: "translateY(-2px)",
  },
  imgWrap: {
    background: "#f5f5f5",
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  productImg: {
    maxHeight: "100%",
    maxWidth: "100%",
    objectFit: "contain",
  },
  productInfo: {
    padding: "12px 14px 14px",
  },
  productNameRow: {
    marginBottom: 6,
  },
  productName: {
    fontSize: 13.5,
    fontWeight: 600,
    color: "#111",
    lineHeight: 1.3,
  },
  productPriceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 600,
    color: "#222",
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1.5px solid #ddd",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#111",
    flexShrink: 0,
  },
  productMeta: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTop: "1px solid #f0f0f0",
  },
  metaLabel: {
    fontSize: 12,
    color: "#999",
  },
  metaDivider: {
    width: 1,
    height: 12,
    background: "#e0e0e0",
  },
};
