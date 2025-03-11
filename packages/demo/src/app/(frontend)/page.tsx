import { SignInButton } from "@/components/sign-in-btn";
export default function Home() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "1.5rem", // Added padding for smaller screens
      }}
    >
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem", // Increased gap for better spacing
          alignItems: "center",
          justifyContent: "center",
          width: "100%", // Ensure main takes full width
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem", // Reduced gap for title and subtitle
            alignItems: "center", // Center-align title and subtitle
          }}
        >
          <h1
            style={{
              fontWeight: "bold",
              fontSize: "2.25rem", // Responsive font size
              textAlign: "center",
              color: "black",
            }}
          >
            Better Auth x Payload CMS
          </h1>
        </div>
        <div
          style={{
            width: "100%", // Use full width for the container
            maxWidth: "600px", // Max width for larger screens
            display: "flex",
            flexDirection: "column",
            gap: "1rem", // Reduced gap
          }}
        >
          <SignInButton />
        </div>
      </main>
    </div>
  );
}
