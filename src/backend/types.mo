import Set "mo:map/Set";

module {
    public type CompanyId = Nat;

    public type Sector = {
        #Industrial: {
            #Manufacturing: Text;
            #EnergyUtilities: Text;
            #ConstructionInfrastructure: Text;
            #Logistics: Text;
            #Other: Text;
        };
        #Administrative: {
            #BusinessManagement: Text;
            #FinanceAccounting: Text;
            #LegalCompliance: Text;
            #HumanResources: Text;
            #MarketingCommunications: Text;
            #Other: Text;
        };
        #TechnologyInnovation: {
            #InformationTechnology: Text;
            #SoftwareDevelopment: Text;
            #ArtificialIntelligence: Text;
            #Telecommunications: Text;
            #ResearchDevelopment: Text;
            #Other: Text;
        };
        #HealthcareLifeSciences: {
            #MedicalServices: Text;
            #Pharmaceuticals: Text;
            #PublicHealth: Text;
            #SocialServices: Text;
            #VeterinaryServices: Text;
            #Other: Text;
        };
        #EducationTraining: {
            #PrimarySecondaryEducation: Text;
            #HigherEducation: Text;
            #VocationalTraining: Text;
            #CorporateTraining: Text;
            #Other: Text;
        };
        #FinancialBusinessServices: {
            #BankingInvestment: Text;
            #Insurance: Text;
            #Consulting: Text;
            #Entrepreneurship: Text;
            #Other: Text;
        };
        #RetailHospitalityEntertainment: {
            #RetailEcommerce: Text;
            #TourismTravel: Text;
            #FoodBeverage: Text;
            #ArtsMedia: Text;
            #Other: Text;
        };
        #AgricultureEnvironmentalServices: {
            #FarmingAgribusiness: Text;
            #NaturalResourcesManagement: Text;
            #EnvironmentalConservation: Text;
            #RenewableEnergy: Text;
            #Other: Text;
        };
        #PublicSectorNonprofits: {
            #GovernmentServices: Text;
            #LawEnforcementDefense: Text;
            #NonprofitOrganizations: Text;
            #EmergencyServices: Text;
            #Other: Text;
        };
        #Other: Text;
    };

    public type CardDataInit = {
        name: Text;
        email: Text;
        phone: Nat;
        photo: Blob; //Foto original hasta 1 MB 
        photoPreview: Blob; //Foto reducida para previsualización < 10Kb
        profession: Text;
        keyWords: [Text]; //Skills
        links: [Text]; //SocialNetworks y otros links
    };

    public type Card = CardDataInit and {
        bio: Text;
        sector: [Sector];
        reentrancyStatus: Bool;
        owner: Principal;
        creator: Principal;
        lastModifiedDate: Int;
        requestsEmployee: [Position];
        contacts: Set.Set<Principal>;
        contactRequests: Set.Set<Principal>;
        score: Nat;
        reviews: [Text];
        visiblePositions: Bool;
        positions: [Position];
        historyLog: [EventId];
        certificates: [Certificate];
        kyc: Bool;
        emailVerified: Bool;
        phoneVerified: Bool;
    };

    public type EventId = Nat;
    
    public type Event = {
        date: Int;
        title: Text;
        description: Text;   
    };

    public type Certificate = {
        title: Text;
        institution: Text;
        date: Int;
        expirationDate: ?Int;
        photo: ?Blob;
        url: ?Text;
    };

    // public func chash(c: Certificate): Nat32 {
        
    // };

    public type Relation = {
        #None;
        #Self;
        #ContactRequester;
        #ContactInvited;
        #Contact;
        #EmployedRequired;
    };

    public type CardPublicData = {
        owner: Principal;
        name: Text;
        photo: Blob;
        photoPreview: Blob;
        profession: Text;
        keyWords: [Text];
        positions: [Position];
        score: Nat;
        reviews: [Text];
        contactQty: Nat;
        links: [Text];
        certificates: [Certificate];
        relationWithCaller: Relation;
        kyc: Bool;
    };
    public type CompleteCardData = CardPublicData and {
        contactRequests: [{principal: Principal; name: Text}];
        requestsEmployee: [Position];
        email: Text;
        phone: Nat;
    };

    public type CardPreview = {
        owner: Principal;
        name: Text;
        photoPreview: Blob; //Foto reducida para previsualización < 64Kb
        profession: Text;
        keyWords: [Text];
        positions: [Position];
        certificates: [Certificate]
    };

    public type UpdatableData = {
        pofession: Text;
        keyWords: [Text];
        bio: Text;
        sector: [Sector];
        visiblePositions: Bool;
    };

    public type CompaniInit = {
        phone: Nat;
        logo: Blob;
        photoCeo: Blob;
        thumbnailLogo: Blob;
        thumbnailPhotoCeo: Blob;
        foundedYear: Nat;
        name: Text;
        location: Text;
        website: ?Text;
        email: Text;
        industry: Text;
        ceo: Text;
        description: Text;
        socialNetworks: [Text];
    };

    public type Company = CompaniInit and {
        owner: Principal;
        verified: Bool;
        companyEmployees: Nat;
        scoring: Nat;
    };
     public type Position = {
        startDate: Int;
        endDate: ?Int;
        company: CompanyId; 
        position: Text
    };

    public type User = {
        name: Text;
        principal: Principal;
    };

    type ChatId = Nat32;
    public type Notification3 = {
        
        #Msg: {nameSender: Text;  date: Int; sender: Principal; chatId: ChatId};
        #ContactRequest: {date: Int; requester: User };
        #ContactAccepted: {date: Int; acceptor: User}
    };

    public type Notification = {
        date: Int;
        kind: {
            #Msg: {nameSender: Text; sender: Principal; chatId: ChatId};
            #ContactRequest: User;
            #ContactAccepted: User
        } 
    };

    
}