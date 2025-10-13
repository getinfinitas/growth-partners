// import Link from "next/link";

// Force dynamic rendering to avoid static generation issues with sidebar layout
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}
