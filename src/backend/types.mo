import Set "mo:map/Set";

module {
    public type CompanyId = Nat;

    public type CardDataInit = {
        name: Text;
        email: Text;
        phone: Nat;
        photo: Blob; //Foto original hasta 1.5 MB 
        photoPreview: Blob; //Foto reducida para previsualización < 64Kb
        profession: Text;
        skills: [Text];
        links: [Text]
    };

    public type Card = CardDataInit and {
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
        certificates: [Certificate]
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
        url: ?Text;
    };

    // public func chash(c: Certificate): Nat32 {
        
    // };

    public type CardPublicData = {
        owner: Principal;
        name: Text;
        photo: Blob;
        profession: Text;
        skills: [Text];
        positions: [Position];
        score: Nat;
        reviews: [Text];
        contactQty: Nat;
        links: [Text];
        certificates: [Certificate]
    };
    public type CompleteCardData = CardPublicData and {
        requestsEmployee: [Position];
        email: Text;
        phone: Nat;
    };

    public type CardPreview = {
        owner: Principal;
        name: Text;
        photoPreview: Blob; //Foto reducida para previsualización < 64Kb
        profession: Text;
        skills: [Text];
        positions: [Position];
        certificates: [Certificate]
    };

    public type UpdatableData = {
        email: Text;
        phone: Nat;
        porfession: Text;
        skils: [Text];
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

    
}