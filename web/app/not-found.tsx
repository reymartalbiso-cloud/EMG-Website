import Link from "next/link";
import { PORTAL_URL } from "@/lib/links";

export default function NotFound() {
  return (
    <div className="nf">
      <span className="code">ERROR 404: CONTAINER NOT FOUND</span>
      <h1 className="display">This page never shipped.</h1>
      <p>
        The address you followed doesn&apos;t exist. It may have moved when we
        rebuilt the site. Everything we sell is one click away:
      </p>
      <div className="actions">
        <Link className="btn btn-accent" href="/shop">Shop all models</Link>
        <Link className="btn btn-ghost" href="/">Start at the front page</Link>
        <a className="btn btn-ghost" href={PORTAL_URL}>Track your order</a>
      </div>
    </div>
  );
}