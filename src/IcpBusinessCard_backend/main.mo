import Types "types";
import Map "mo:map/Map";
import Set "mo:map/Set";
import { now } "mo:base/Time";
import { phash; nhash} "mo:map/Map";
import Principal "mo:base/Principal";

actor {

    type CompanyInit = Types.CompaniInit;
    type Company = Types.Company;
    type CompanyId = Nat;
    type CardDataInit = Types.CardDataInit;
    type Card = Types.Card;
    type CardPublicData = Types.CardPublicData;
    type CompleteCardData = Types.CompleteCardData;
    type UpdatableData = Types.UpdatableData;
    type Id = Nat;
    type CreateResult = {
        #Ok: Id;
        #Err: Text;
    };

    stable let companiesId = Map.new<Principal, CompanyId>();
    stable let companies = Map.new<CompanyId, Company>();
    stable let cards = Map.new<Principal, Card>();
    stable var lastCompanyId = 0;
    stable var updateLockTime: Int = 43_200_000_000_000; // 12 horas en nanosegundos; 

    func isCompany(p: Principal): Bool {
        switch(Map.get<Principal, CompanyId>(companiesId, phash, p)){
            case null { false };
            case (?Company) { true };
        }
    };

    func hasCard(p: Principal): Bool {
        switch(Map.get<Principal, Card>(cards, phash, p)){
            case null { false };
            case (_) { true };
        }
    };

    public shared ({ caller }) func setUpdateLockTime(seg: Int):async Int{
        assert(Principal.isController(caller));
        updateLockTime := seg * 1000000000;
        updateLockTime
    };

    public shared ({ caller }) func createCompany(init: CompanyInit):async CreateResult {
        if(Principal.isAnonymous(caller)){ return #Err("Caller anonymous")};
        if(isCompany(caller)){ return #Err("The caller already has a company associated")};
        lastCompanyId += 1;
        ignore Map.put<Principal, CompanyId>(companiesId, phash, caller, lastCompanyId);
        let newCompany = {
            init with
            owner = caller;
            verified = false;
            companyEmployees = 0;
            scoring = 0;
        };
        ignore Map.put<CompanyId, Company>(companies, nhash, lastCompanyId, newCompany);
        #Ok(lastCompanyId)
    };

    func safeCreateCard(init: CardDataInit, owner: Principal, creator: Principal): {#Ok: CardPublicData; #Err: Text} {
        if(hasCard(owner)){ return #Err("The caller already has a card associated")};
        let newCard: Card = {
            init with
            owner;
            creator;
            lastModifiedDate = now();
            contacts = Set.new<Principal>();
            contactRequests= Set.new<Principal>();
            score = 0;
            rewiews: [Text] = [];
        };
        ignore Map.put<Principal, Card>(cards, phash, owner, newCard);
        let publicData: CardPublicData = { init with
            score = 0;
            rewiews: [Text] = [];
            contactQty = 0;
        };
        #Ok(publicData);
    };

    public shared ({ caller }) func createCard(init: CardDataInit): async {#Ok: CardPublicData; #Err: Text} {
        assert(not Principal.isAnonymous(caller));
        safeCreateCard(init, caller, caller);
    };

    public shared ({ caller }) func createCardFor(init: CardDataInit, owner: Principal): async {#Ok: CardPublicData; #Err: Text} {   
        let companId = Map.get<Principal, CompanyId>(companiesId, phash, caller);
        switch companId {
            case null {
                #Err("Caller cannot create cards for third parties")
            };
            case (?_company) {
                //TODO sumar unempleado a la compañia
                safeCreateCard(init, owner, caller);
            }
        }
    };

    public query func getPublicDataCard(p: Principal): async {#Ok: CardPublicData; #Err: Text} {
        let card = Map.get<Principal, Card>(cards, phash, p);
        switch card {
            case null { #Err("There is no card associated with the principal provided")};
            case(?card) {
                let dataPublic: CardPublicData = {
                    card with
                    contactQty = card.contacts.size();
                };
                #Ok(dataPublic)
            }
        }
    };

    public query ({ caller }) func getCompleteDataCard(p: Principal):async  {#Ok: CompleteCardData; #Err: Text} {
        let pCard = Map.get<Principal, Card>(cards, phash, p);
        switch pCard {
            case null {#Err("There is no card associated with the principal provided")};
            case(?pCard){
                let callerCard = Map.get<Principal, Card>(cards, phash, caller);
                switch callerCard {
                    case null {#Err("There is no card associated with the caller")};
                    case (?callerCard){
                        if(not Set.has<Principal>(pCard.contacts, phash, caller) and
                            not Set.has<Principal>(callerCard.contactRequests, phash, p) and
                            caller != p) { 
                            return #Err("Access denied");
                        };
                        let data: CompleteCardData = {
                            pCard with
                            contactQty = pCard.contacts.size();
                        };
                        #Ok(data)
                    }
                }  
                
            }
        } 
    };

    public shared ({ caller }) func getMyCard(): async ?CompleteCardData {
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { null };
            case (?card){
                ?{
                    card with 
                    contactQty = card.contacts.size();
                };
            }
        }
    };

    public shared ({ caller }) func updateCard(data: UpdatableData): async {#Ok: CardPublicData; #Err: Text} {
        let card = Map.get<Principal, Card>(cards,phash, caller);
        switch card {
            case null {#Err("There is no card associated with the caller")};
            case(?card) {
                if(now() < card.lastModifiedDate + updateLockTime){
                    return #Err("The last update was very recent, you must wait");
                };
                let updateCard: Card = {
                    card with
                    data;
                    lastModifiedDate = now()
                };
                ignore Map.put<Principal, Card>(cards, phash, caller, updateCard);
                let publicDataCard: CardPublicData = {
                    updateCard with 
                    contactQty = card.contacts.size();
                };
                #Ok(publicDataCard)
            }
        }
    };
    
    public shared ({ caller }) func sharedCard(p: Principal):async  {#Ok; #Err: Text} {
        let callerCard = Map.get<Principal, Card>(cards, phash, caller);
        switch callerCard {
            case null { #Err("The caller does not have a card") };
            case(?callerCard) {
                let pCard = Map.get<Principal, Card>(cards, phash, p);
                switch pCard {
                    case null {#Err("The principal provided does not have any associated card")};
                    case(?pCard) {
                        if(Set.has<Principal>(pCard.contacts, phash, caller)){
                            return #Err("They are already in contact");
                        };
                        if(Set.has<Principal>(callerCard.contactRequests, phash, p)){
                            ignore Set.put<Principal>(pCard.contacts, phash, caller);
                            ignore Set.put<Principal>(callerCard.contacts, phash, p);
                            ignore Set.remove<Principal>(callerCard.contactRequests, phash, p);   
                        } else {
                            ignore Set.put<Principal>(pCard.contactRequests, phash, caller);

                        };
                        return #Ok;     

                    }
                }
            }
        }
    };

    public shared ({ caller }) func getContactRequests():async {#Ok: [Principal]; #Err: Text}{
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { #Err("There is no card associated with the caller")};
            case (?card){
                #Ok(Set.toArray<Principal>(card.contactRequests));
            }
        }
    };

    public shared ({ caller }) func getMyContacts(): async [Principal] {
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { [] };
            case (?card){
                Set.toArray<Principal>(card.contacts);
            }
        }
    };

};
