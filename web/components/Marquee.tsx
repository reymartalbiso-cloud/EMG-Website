const ITEMS = [
  "Transportable Homes",
  "Site Accommodation",
  "Ablution Blocks",
  "Container Domes",
];

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((rep) => (
          <span key={rep} className="marquee-run">
            {ITEMS.map((item) => (
              <span key={item}>
                <span className="outline">{item}</span>
                <span className="dot">·</span>
              </span>
            ))}
            <span className="solid">Built for the Territory</span>
            <span className="dot">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}