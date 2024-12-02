import React, { useState, ChangeEvent, FormEvent, useContext } from 'react';
import { AuthContext } from "../context/AuthContext";
import { UpdatableData, Sector } from '../declarations/backend/backend.did';



interface EditFormProps {
    onClose: () => void
    onSubmit: (data: UpdatableData) => void
    children?: React.ReactNode;
}
const sectorData = {
    'HealthcareLifeSciences': {
        'SocialServices': 'Social Services',
        'MedicalServices': 'Medical Services',
        'Pharmaceuticals': 'Pharmaceuticals',
        'VeterinaryServices': 'Veterinary Services',
        'PublicHealth': 'Public Health',
        'Other': 'Other',
    },
    'TechnologyInnovation': {
        'SoftwareDevelopment': 'Software Development',
        'ResearchDevelopment': 'Research & Development',
        'Other': 'Other',
        'Telecommunications': 'Telecommunications',
        'InformationTechnology': 'Information Technology',
        'ArtificialIntelligence': 'Artificial Intelligence',
    },
    'PublicSectorNonprofits': {
        'LawEnforcementDefense': 'Law Enforcement & Defense',
        'NonprofitOrganizations': 'Nonprofit Organizations',
        'EmergencyServices': 'Emergency Services',
        'Other': 'Other',
        'GovernmentServices': 'Government Services',
    },
    'RetailHospitalityEntertainment': {
        'TourismTravel': 'Tourism & Travel',
        'FoodBeverage': 'Food & Beverage',
        'ArtsMedia': 'Arts & Media',
        'RetailEcommerce': 'Retail & Ecommerce',
        'Other': 'Other',
    },
    'EducationTraining': {
        'PrimarySecondaryEducation': 'Primary & Secondary Education',
        'CorporateTraining': 'Corporate Training',
        'Other': 'Other',
        'VocationalTraining': 'Vocational Training',
        'HigherEducation': 'Higher Education',
    },
    'AgricultureEnvironmentalServices': {
        'NaturalResourcesManagement': 'Natural Resources Management',
        'FarmingAgribusiness': 'Farming & Agribusiness',
        'RenewableEnergy': 'Renewable Energy',
        'Other': 'Other',
        'EnvironmentalConservation': 'Environmental Conservation',
    },
    'Other': {
        'Other': 'Other',
    },
    'FinancialBusinessServices': {
        'Insurance': 'Insurance',
        'Consulting': 'Consulting',
        'BankingInvestment': 'Banking & Investment',
        'Other': 'Other',
        'Entrepreneurship': 'Entrepreneurship',
    },
    'Industrial': {
        'EnergyUtilities': 'Energy & Utilities',
        'Logistics': 'Logistics',
        'Other': 'Other',
        'ConstructionInfrastructure': 'Construction & Infrastructure',
        'Manufacturing': 'Manufacturing',
    },
    'Administrative': {
        'BusinessManagement': 'Business Management',
        'FinanceAccounting': 'Finance & Accounting',
        'LegalCompliance': 'Legal & Compliance',
        'Other': 'Other',
        'MarketingCommunications': 'Marketing & Communications',
        'HumanResources': 'Human Resources',
    }
}
const renderSectorOptions = (sector: Object) => {
    return Object.entries(sector).map(([sectorKey, sectorValues]) => (
        <optgroup key={sectorKey} label={sectorKey}>
            {Object.entries(sectorValues).map(([subsectorKey, subsectorValue]) => (
                <option key={subsectorKey} value={`${sectorKey}.${subsectorKey}`}>
                    {subsectorValue?.toString()}
                </option>
            ))}
        </optgroup>
    ));
};

const EditForm: React.FC<EditFormProps> = ({ onClose, onSubmit }) => {

    const { cardDataUser } = useContext(AuthContext);
    const [formData, setFormData] = useState<UpdatableData>({
        profession:  "",
        keyWords: [],
        bio: '',
        sector: [],
        visiblePositions: false,
    });

    

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Comprobar si es un input y tiene el atributo 'checked'
        const fieldValue = type === 'checkbox' && e.target instanceof HTMLInputElement
            ? e.target.checked
            : value;

        setFormData((prevData) => ({
            ...prevData,
            [name]: fieldValue,
        }));
    };

    const handleKeyWordsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, keyWords: e.target.value.split(',').map((kw) => kw.trim()) });
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };
    console.log(cardDataUser?.profession)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-5">

            <form onSubmit={handleFormSubmit} className="w-full max-w-3xl p-6 bg-gray-900 shadow-md rounded-md space-y-4 ">
                <h2 className="text-xl sm:text-2xl text-gray-300 font-semibold text-center">Actualizar Datos</h2>

                <section className=''>
                    <p className="text-xl"> <span className="mr-4 text-gray-400">User Name:</span>  {cardDataUser?.name}</p>
                    <p className="text-xl"><span className="mr-4 text-gray-400">Email: </span>  {cardDataUser?.email}</p>
                    {(cardDataUser && cardDataUser.phone > 0) && 
                    <p className="text-xl"><span className="mr-4 text-gray-400">Phone: </span> {Number(cardDataUser?.phone)}</p>}
                </section>

                {/* Campos editables */}
                <label className="block">
                    <span className="text-gray-600">Profession:</span>
                    <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        className="block w-full p-2 border border-gray-300 rounded-md  bg-[#101010]"
                        style={ {
                            backgroundColor:"#101010",
                            borderColor: "#bbb"
                        }}

                    />
                </label>

                <label className="block">
                    <span className="text-gray-600">Keywords (separate by commas):</span>
                    <textarea
                        name="keyWords"
                        value={formData.keyWords.join(', ')}
                        onChange={handleKeyWordsChange}
                        className="block w-full p-2 border border-gray-300 rounded-md  bg-[#101010]"
                    />
                </label>

                <label className="block">
                    <span className="text-gray-600">Bio:</span>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="block w-full p-2 border border-gray-300 rounded-md  bg-[#101010]"
                    />
                </label>

                <label className="block">
                    <span className="text-gray-600">Sector:</span>
                    <select
                        name="sector"
                        // value={formData.sector}
                        onChange={handleInputChange}
                        className="block w-full p-2 border border-gray-300 bg-[#101010] rounded-md"
                        multiple
                    >
                        <option value="">Select a Sector</option>
                        {renderSectorOptions(sectorData)}
                    </select>
                </label>

                <label className="block">
                    <span className="text-gray-600">Visible Positions:</span>
                    <input
                        type="checkbox"
                        name="visiblePositions"
                        checked={formData.visiblePositions}
                        onChange={handleInputChange}
                        className="ml-2"
                    />
                </label>

                <button className="mr-10 w-1/4 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition duration-300"
                    onClick={onClose}
                >
                    Cancel
                </button>

                <button type="submit" className="ml-10 w-1/4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    onClick={() => onSubmit(formData)}    
                >
                    
                    Submit
                </button>

            </form>
        </div>
    );
};

export default EditForm;
