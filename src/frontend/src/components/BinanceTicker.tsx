import { useRef, useState } from "react";
import { useBinanceTicker } from "../hooks/useBinanceTicker";

const BinanceTicker = () => {
  const [asset, setAsset] = useState("icp");
  const { price, colorPrice } = useBinanceTicker(asset);

  const [showModal, setShowModal] = useState(false);
  const [customAsset, setCustomAsset] = useState('');
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLDivElement>(null);

  const updateAsset = (newAsset: string) => {
    if (asset !== newAsset) {
      setAsset(newAsset.toLowerCase());
    }
    setShowModal(false);
  };

  const handleOpenModal = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalPos({ top: rect.bottom + 8, left: rect.left - 20 });
    }
    setShowModal(true);
  };

  return (
    <div className="px-1 sm:px-2 py-1">
      <div 
        onClick={handleOpenModal} 
        ref={buttonRef} 
        className="cursor-pointer text-[#888888] p-0"
      >
        {price ? (
          <div className="text-left bg-[#030310] p-2 rounded-xl 
              w-[120] sm:w-[150px] text-sm text-[12px]:sm ">
            <span className="text-white mr-1 sm:mr-3">{asset.toUpperCase()}</span>
            <span className={colorPrice}>
              
              ${Number(price).toFixed(3)}
            </span>
          </div>
        ) : (
          <div className="bg-[#030310] p-2 rounded-xl w-[100px] sm:w-[150px]">Loading...</div>
        )}
      </div>

      {/* Modal flotante */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="absolute bg-[#151520] p-4 rounded-xl w-[200px] shadow-lg" style={{ top: modalPos.top, left: modalPos.left }}>
            <div className="flex flex-col gap-y-2 mb-4">
              {['btc', 'eth', 'icp', 'bnb', 'sol','xrp'].map((coin) => (
                <button
                  key={coin}
                  onClick={() => updateAsset(coin)}
                  className="bg-gray-800 hover:bg-gray-600 text-white px-3 py-1 rounded"
                >
                  {coin}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="dot"
              value={customAsset}
              onChange={(e) => setCustomAsset(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // evita comportamientos raros
                  updateAsset(customAsset);
                }
              }}
              className="w-[80px] border border-gray-300 px-2 py-1 rounded mb-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BinanceTicker;
