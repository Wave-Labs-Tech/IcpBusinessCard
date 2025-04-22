import { useState, ChangeEvent } from "react";

type CountryCode = {
  code: string;
  flag: string;
  name: string;
  nomenclature: string;
};

const countryCodes: CountryCode[] = [
  { code: "54", flag: "🇦🇷", name: "Argentina", nomenclature: "AR" },
  { code: "591", flag: "🇧🇴", name: "Bolivia", nomenclature: "BO" },
  { code: "55", flag: "🇧🇷", name: "Brasil", nomenclature: "BR" }, 
  { code: "1", flag: "🇨🇦", name: "Canadá", nomenclature: "CA" },
  { code: "56", flag: "🇨🇱", name: "Chile", nomenclature: "CL" },
  { code: "57", flag: "🇨🇴", name: "Colombia", nomenclature: "CO" },
  { code: "506", flag: "🇨🇷", name: "Costa Rica", nomenclature: "CR" },
  { code: "53", flag: "🇨🇺", name: "Cuba", nomenclature: "CU" },
  { code: "593", flag: "🇪🇨", name: "Ecuador", nomenclature: "EC" },
  { code: "503", flag: "🇸🇻", name: "El Salvador", nomenclature: "SV" },
  { code: "1", flag: "🇺🇸", name: "Estados Unidos", nomenclature: "US" }, 
  { code: "502", flag: "🇬🇹", name: "Guatemala", nomenclature: "GT" },
  { code: "509", flag: "🇭🇹", name: "Haití", nomenclature: "HT" },
  { code: "504", flag: "🇭🇳", name: "Honduras", nomenclature: "HN" },
  { code: "52", flag: "🇲🇽", name: "México", nomenclature: "MX" }, 
  { code: "505", flag: "🇳🇮", name: "Nicaragua", nomenclature: "NI" },
  { code: "507", flag: "🇵🇦", name: "Panamá", nomenclature: "PA" },
  { code: "595", flag: "🇵🇾", name: "Paraguay", nomenclature: "PY" },
  { code: "51", flag: "🇵🇪", name: "Perú", nomenclature: "PE" },
  { code: "1787", flag: "🇵🇷", name: "Puerto Rico", nomenclature: "PR" },
  { code: "598", flag: "🇺🇾", name: "Uruguay", nomenclature: "UY" },
  { code: "58", flag: "🇻🇪", name: "Venezuela", nomenclature: "VE" },
  { code: "234", flag: "🇳🇬", name: "Nigeria", nomenclature: "NG" }, 
  { code: "254", flag: "🇰🇪", name: "Kenia", nomenclature: "KE" }, 
  { code: "233", flag: "🇬🇭", name: "Ghana", nomenclature: "GH" },
  { code: "27", flag: "🇿🇦", name: "Sudáfrica", nomenclature: "ZA" },
  { code: "225", flag: "🇨🇮", name: "Costa de Marfil", nomenclature: "CI" },
  { code: "20", flag: "🇪🇬", name: "Egipto", nomenclature: "EG" },
  { code: "212", flag: "🇲🇦", name: "Marruecos", nomenclature: "MA" },
  // Resto del mundo (alta adopción cripto)
  { code: "91", flag: "🇮🇳", name: "India", nomenclature: "IN" },
  { code: "62", flag: "🇮🇩", name: "Indonesia", nomenclature: "ID" }, 
  { code: "84", flag: "🇻🇳", name: "Vietnam", nomenclature: "VN" }, 
  { code: "63", flag: "🇵🇭", name: "Filipinas", nomenclature: "PH" }, 
  { code: "92", flag: "🇵🇰", name: "Pakistán", nomenclature: "PK" }, 
  { code: "66", flag: "🇹🇭", name: "Tailandia", nomenclature: "TH" },
  { code: "90", flag: "🇹🇷", name: "Turquía", nomenclature: "TR" }, 
  { code: "971", flag: "🇦🇪", name: "Emiratos Árabes Unidos", nomenclature: "AE" }, 
  { code: "65", flag: "🇸🇬", name: "Singapur", nomenclature: "SG" }, 
  { code: "41", flag: "🇨🇭", name: "Suiza", nomenclature: "CH" }, 
  { code: "44", flag: "🇬🇧", name: "Reino Unido", nomenclature: "GB" },
  { code: "49", flag: "🇩🇪", name: "Alemania", nomenclature: "DE" },
  { code: "81", flag: "🇯🇵", name: "Japón", nomenclature: "JP" },
  { code: "82", flag: "🇰🇷", name: "Corea del Sur", nomenclature: "KR" },
  { code: "86", flag: "🇨🇳", name: "China", nomenclature: "CN" }
];

export default function PhonePrefixSelector(props: {handleChange: (value: string) => void}) {
  const [countryCode, setCountryCode] = useState<string>("1");

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value.trim());
    props.handleChange(e.target.value.trim());
  };

  return (
    <div className="flex flex-col gap-4 w-[120px]">
      <div className="flex gap-2 bg-[#1a1a1a] rounded-lg items-center">
        
        <select
          value={countryCode}
          onChange={handleSelectChange}
          className="flex-2 text-white text-[13px]  bg-[#252525] rounded-lg custom-scrollbar 
          font-normal focus:outline-none py-1 pl-1 pr-0 appearance-none w-[100px]"
        >
          {countryCodes.map((country) => (
            <option 
              key={country.nomenclature} 
              value={country.code}
              title={country.name}
            >
              {country.flag} {country.nomenclature} + {country.code}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
