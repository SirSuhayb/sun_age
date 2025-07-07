import React, { useState } from "react";
import Image from "next/image";
import { useFrameSDK } from "~/hooks/useFrameSDK";
import { SunMenu } from "../SunMenu";
import { useConnect } from "wagmi";

interface HeaderProps {
  formattedDate: string;
  onAboutClick?: () => void;
  onSolarClick?: () => void;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ formattedDate, onAboutClick, onSolarClick, onLogoClick }) => {
  const { sdk, isInFrame } = useFrameSDK();
  const [sunMenuOpen, setSunMenuOpen] = useState(false);
  const { connect, connectors } = useConnect();

  const handleSwapClick = async () => {
    if (!isInFrame || !sdk) return;

    // Base network SOLARA token
    const solarTokenAddress = 'eip155:8453/erc20:0x746042147240304098C837563aAEc0F671881B07';
    // Base network USDC token
    const usdcTokenAddress = 'eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

    await sdk.actions.swapToken({
      buyToken: solarTokenAddress,
      sellToken: usdcTokenAddress,
      sellAmount: '1000000', // 1 USDC with 6 decimals
    });
  };

  const handleSunClick = () => {
    // For farcaster mini app, keep existing swap functionality
    if (isInFrame && sdk) {
      handleSwapClick();
    } else {
      // For web users, open the sun menu
      setSunMenuOpen(!sunMenuOpen);
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (connectors && connectors.length > 0) {
        await connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleClaimTokens = () => {
    // This would trigger the Sol Age claim modal
    if (onSolarClick) {
      onSolarClick();
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white" style={{ boxShadow: '0 1px 0 0 #e5e7eb' }}>
      <div className="pt-0 pb-0 px-4 flex flex-col items-center justify-center relative w-full">
        {/* Top Row: About and $SOLAR links */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mt-4 mb-2">
          {/* About (i) icon */}
          <button
            aria-label="About Solara"
            onClick={onAboutClick}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white shadow-sm hover:bg-gray-100 transition-colors"
            style={{ fontSize: 18, fontWeight: 700, borderRadius: 0 }}
          >
            i
          </button>
          <div className="flex-1 text-center">
            <span
              className="block text-[#d4af37] w-[180px] h-[45px] mx-auto select-none cursor-pointer"
              onClick={onLogoClick}
              role="button"
              tabIndex={0}
              onKeyPress={e => {
                if ((e.key === 'Enter' || e.key === ' ') && onLogoClick) {
                  onLogoClick();
                }
              }}
            >
              <svg width="180" height="45" viewBox="0 0 627 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M36.6523 0C53.8132 6.29946e-06 62.7117 8.68652 65.6777 8.68652C67.1607 8.68634 68.2199 6.3552 68.8555 1.90625H75V47.8809H68.6436C65.4656 19.2794 55.508 7.20312 36.0166 7.20312C20.7627 7.20317 11.6525 15.4657 11.6523 30.2959C11.6523 42.5839 16.1015 49.5759 31.9912 60.5928L51.6943 74.1523C68.4315 85.8048 75.6348 97.2455 75.6348 114.83C75.6346 137.075 62.0755 149.999 39.8301 149.999C22.0342 149.999 12.2887 141.313 9.32227 141.312C7.83925 141.312 6.77915 143.643 6.14355 148.092H0V96.6094H6.35547C9.53341 128.601 20.127 142.796 40.6777 142.796C55.508 142.796 64.4061 133.897 64.4062 118.855C64.4062 104.237 59.5335 95.7622 45.7627 86.2285L26.0596 72.6689C7.41567 59.7453 0.423871 48.9403 0.423828 32.415C0.423828 11.8643 13.983 0 36.6523 0ZM139.316 0C169.824 0.000300237 191.434 29.237 191.435 74.999C191.435 120.761 169.824 149.999 139.316 149.999C108.808 149.999 87.1973 120.761 87.1973 74.999C87.1974 29.2368 108.808 0 139.316 0ZM238.312 8.47461C224.542 8.89834 223.271 12.7116 223.271 30.2959V121.821C223.271 138.558 225.601 141.101 240.431 141.101H253.778C271.787 141.101 275.813 134.109 284.075 96.6094H290.431L284.922 147.033H196.787V141.524C209.711 141.313 211.83 138.77 211.83 125.211V24.7881C211.83 11.2288 209.711 8.68647 196.787 8.47461V2.96582H238.312V8.47461ZM609.587 118.643C615.731 137.075 618.485 140.465 626.536 141.524V147.032H584.163V141.524C595.604 141.313 600.477 138.77 600.477 131.566C600.477 128.388 599.629 124.151 597.723 118.643L590.308 97.0332H541.579L534.799 117.796C533.104 123.092 532.045 127.541 532.045 130.719C532.045 138.134 536.918 141.101 549.418 141.524V147.032H513.216V147.033H496.479L453.682 72.0332H435.462V123.093C435.462 138.135 438.004 141.101 450.292 141.524V147.033H408.979V141.524C421.902 141.313 424.021 138.77 424.021 125.211V24.7881C424.021 11.2288 421.902 8.68647 408.979 8.47461V2.96582H457.072C484.402 2.96592 497.538 15.0423 497.538 36.4404C497.538 53.1775 486.944 66.7363 466.394 70.7617L500.08 126.906C506.026 136.755 509.04 139.92 511.978 141.121C517.581 139.476 521.203 133.563 526.536 117.372L561.494 11.8643L557.681 1.05859H569.757L609.587 118.643ZM389.944 118.643C396.088 137.075 398.843 140.465 406.894 141.524V147.032H364.521V141.524C375.961 141.313 380.834 138.77 380.834 131.566C380.834 128.388 379.987 124.151 378.08 118.643L370.665 97.0332H321.937L315.156 117.796C313.462 123.092 312.402 127.541 312.402 130.719C312.402 138.134 317.275 141.101 329.775 141.524V147.032H290.369V141.524C297.148 140.677 300.962 135.38 306.894 117.372L341.852 11.8643L338.038 1.05859H350.114L389.944 118.643ZM139.316 7.20312C115.164 7.20312 101.605 33.0503 101.604 74.999C101.604 116.948 115.164 142.796 139.316 142.796C163.469 142.796 177.027 116.948 177.027 74.999C177.027 33.0506 163.468 7.20346 139.316 7.20312ZM324.267 90.2529H368.334L346.089 24.5752L324.267 90.2529ZM543.909 90.2529H587.977L565.731 24.5752L543.909 90.2529ZM435.462 66.1016H453.682C474.444 66.1016 483.978 54.4488 483.979 37.0762C483.979 18.4323 476.352 8.8985 456.437 8.89844H435.462V66.1016Z" fill="currentColor"/>
              </svg>
            </span>
          </div>
          {/* $SOLAR token link */}
          <button
            onClick={handleSunClick}
            aria-label="$SOLAR Token"
            className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white shadow-sm hover:bg-yellow-100 transition-colors"
            style={{ fontSize: 18, borderRadius: 0 }}
          >
            <span role="img" aria-label="SOLAR">🌞</span>
          </button>
        </div>
        {/* Date */}
        <div className="text-base font-mono font-normal text-sm text-gray-600 mt-0 mb-2 tracking-wider text-center">
          {formattedDate}
        </div>
      </div>
      {/* Divider line below header */}
      <div className="w-full h-px bg-gray-200" />
      
      {/* Sun Menu for web users */}
      <SunMenu
        isOpen={sunMenuOpen}
        onClose={() => setSunMenuOpen(false)}
        onConnectWallet={handleConnectWallet}
        onClaimTokens={handleClaimTokens}
      />
    </header>
  );
};

export default Header; 