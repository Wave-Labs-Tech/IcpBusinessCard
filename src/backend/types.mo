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
        skils: [Text];
        visiblePositions: Bool;
        positions: [Position];
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
        rewiews: [Text];
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
        url: ?Text;
    };

    // public func chash(c: Certificate): Nat32 {
        
    // };

    public type CardPublicData = {
        owner: Principal;
        name: Text;
        photo: Blob;
        profession: Text;
        skils: [Text];
        positions: [Position];
        score: Nat;
        rewiews: [Text];
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
        skils: [Text];
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
        company: CompanyId; 
        position: Text
    };

    
}