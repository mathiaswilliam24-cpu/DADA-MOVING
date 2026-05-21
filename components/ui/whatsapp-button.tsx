"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/13466499353"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 9999 }}
      className="group flex items-center gap-2 shadow-2xl"
    >
      {/* Tooltip */}
      <span className="hidden group-hover:flex items-center px-3 py-2 bg-white text-[#075e54] text-sm font-bold rounded-xl shadow-lg border border-[#e2e8f0] whitespace-nowrap">
        Chat with us
      </span>

      {/* WhatsApp circle button */}
      <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
        style={{ backgroundColor: "#25D366" }}>
        {/* Official WhatsApp SVG icon */}
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M16 2C8.268 2 2 8.268 2 16c0 2.444.651 4.734 1.787 6.713L2 30l7.5-1.763A13.944 13.944 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 2c6.617 0 12 5.383 12 12s-5.383 12-12 12a11.946 11.946 0 01-5.97-1.587l-.416-.25-4.455 1.047 1.072-4.33-.273-.435A11.946 11.946 0 014 16C4 9.383 9.383 4 16 4zm-3.44 6.5c-.22 0-.578.082-.882.41-.303.328-1.157 1.13-1.157 2.758 0 1.627 1.184 3.2 1.35 3.42.165.22 2.313 3.697 5.695 5.04 2.823 1.114 3.387.893 3.998.837.612-.056 1.974-.807 2.25-1.587.277-.78.277-1.45.194-1.587-.083-.138-.303-.22-.634-.386-.33-.165-1.974-.973-2.279-1.083-.303-.11-.523-.165-.744.165-.22.33-.854 1.083-1.046 1.304-.193.22-.386.248-.717.083-.33-.165-1.396-.515-2.66-1.64-.984-.876-1.648-1.957-1.84-2.287-.194-.33-.021-.508.145-.672.149-.148.33-.386.495-.579.165-.193.22-.33.33-.55.11-.22.055-.413-.028-.579-.083-.165-.73-1.8-1.018-2.458-.248-.583-.506-.578-.716-.585-.193-.007-.413-.01-.634-.01z"
            fill="white"/>
        </svg>
      </div>
    </a>
  );
}
