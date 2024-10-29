import Types "types";
import Map "mo:map/Map";
import Set "mo:map/Set";
import { now } "mo:base/Time";
import { phash; nhash} "mo:map/Map";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Prim "mo:⛔";

shared ({ caller }) actor class BusinessCard () = this {
  ////////////////////////////// Types declarations ///////////////////////////////////////////
  // Interactions
    type CompanyInit = Types.CompaniInit;
    type Company = Types.Company;
    type CompanyId = Nat;
    type Position = Types.Position;
    type CardDataInit = Types.CardDataInit;
    type Card = Types.Card;
    type CardPublicData = Types.CardPublicData;
    type CompleteCardData = Types.CompleteCardData;
    type UpdatableData = Types.UpdatableData;
    type Certificate = Types.Certificate;
    type Id = Nat;
    type CreateResult = { #Ok: Id; #Err: Text };
    type GetPublicCardsResult = {
        #Ok: {cardsPreview: [CardPreview]; thereIsMore: Bool};
        #Err: Text;
    };
    type CardPreview = Types.CardPreview;

  //////////////////////////// storage and utility variables //////////////////////////////////

    stable let companiesId = Map.new<Principal, CompanyId>();
    stable let companies = Map.new<CompanyId, Company>();
    stable let cards = Map.new<Principal, Card>();
    stable let admins = Set.new<Principal>();
    stable let publicCards = Set.new<Principal>();
    stable var lastCompanyId = 0;
    stable var updateLockTime: Int = 43_200_000_000_000; // 12 horas en nanosegundos;


  
  /////////////////////////////// Private Functions ///////////////////////////////////////////

    Set.add<Principal>(admins, phash, caller);

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

    // func isAdmin

    func safeCreateCard(init: CardDataInit, owner: Principal, creator: Principal): {#Ok: CardPublicData; #Err: Text} {
        if(hasCard(owner)){ return #Err("The caller already has a card associated")};
        let newCard: Card = {
            init with
            owner;
            creator;
            lastModifiedDate = now();
            reentrancyStatus = false;
            contacts = Set.new<Principal>();
            contactRequests= Set.new<Principal>();
            requestsEmployee: [Position] = [];
            score = 0;
            rewiews: [Text] = [];
            historyLog = [];
            visiblePositions = false;
            positions: [Position] = [];
            certificates: [Certificate] = [];
        };
        ignore Map.put<Principal, Card>(cards, phash, owner, newCard);
        ignore Set.put<Principal>(publicCards, phash, owner);
        if(owner != creator){
            ignore Set.put<Principal>(newCard.contactRequests, phash, creator);
        };
        let publicData: CardPublicData = { newCard with
            contactQty = 0;
        };
        #Ok(publicData);
    };

  ////////////////////////////////// Only admins //////////////////////////////////////////////

    // public shared ({ caller }) func addAdmin(a: Principal): async Bool {

    // };
  
  ///////////////////////////// Create elements and setters funcions //////////////////////////

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

    public shared ({ caller }) func createCard(init: CardDataInit): async {#Ok: CardPublicData; #Err: Text} {
        assert(not Principal.isAnonymous(caller));
        safeCreateCard(init, caller, caller);
    };


  /////////////////////////// Funciones exclusivas de perfiles de Empresa //////////////////////

    public shared ({ caller }) func createCardFor(init: CardDataInit, owner: Principal): async {#Ok: CardPublicData; #Err: Text} {   
        let companId = Map.get<Principal, CompanyId>(companiesId, phash, caller);
        switch companId {
            case null {
                #Err("Caller cannot create cards for third parties")
            };
            case (?_company) {
                //TODO sumar un empleado a la compañia
                safeCreateCard(init, owner, caller);
            }
        }
    };
    
    func reentrancyPrevent({cardPID: Principal; reentrancyStatus: Bool}) {
        let card = Map.get<Principal, Card>(cards, phash, cardPID);
        switch card {
            case null { assert false };
            case (?card) {
                ignore Map.put<Principal, Card>(cards, phash, cardPID, { card with reentrancyStatus })
            }
        }
    };
  ////////////////////////////// Protocol for linking in a dependency relationship ////////////////////////////////////////////
    public shared ({ caller }) func employUserExisting({employPrincipalId: Principal; position: Position}): async {#Ok: CardPublicData; #Err: Text} {
        let companyID = Map.get<Principal, CompanyId>(companiesId, phash, caller);
        switch companyID {
            case null { return #Err("There is no company associated with the caller")};
            case (?id) {
                let company = Map.get<CompanyId, Company>(companies, nhash, id); 
                switch company {
                    case null { return #Err("There is no company associated with the caller") };
                    case ( company ) {
                        let cardEmploy = Map.get<Principal, Card>(cards, phash, employPrincipalId);
                        switch cardEmploy {
                            case null {return #Err("There is no Card associated with the principal provided") };
                            case ( ?cardEmploy ) {
                                if (cardEmploy.reentrancyStatus){ return #Err("Reentry process activated, please try again later")};
                                reentrancyPrevent({cardPID = employPrincipalId; reentrancyStatus = true});
                                let updateRequestsEmployee = Prim.Array_tabulate<Position>(
                                    cardEmploy.requestsEmployee.size() + 1,
                                    func i = if(i == 0 ) { {position with startDate = now()} } else {cardEmploy.requestsEmployee[i - 1]}
                                );
                                ignore Map.put<Principal, Card>(
                                    cards, 
                                    phash, 
                                    employPrincipalId,
                                    { cardEmploy with requestsEmployee = updateRequestsEmployee } 
                                );
                                let publicData: CardPublicData = { 
                                    cardEmploy with 
                                    positions = if(cardEmploy.visiblePositions){cardEmploy.positions} else {[]};
                                    contactQty = Set.size(cardEmploy.contacts);
                                };
                                reentrancyPrevent({cardPID = employPrincipalId; reentrancyStatus = false});
                                #Ok(publicData)
                            }
                        }
                    }
                }
            }
        };
    };

    public shared ({ caller }) func acceptEmployment(indexRequest: Nat): async {#Ok: [Position]; #Err: Text} {
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null {#Err("There is no card associated with the caller")};
            case (?card) {
                if (card.reentrancyStatus){ return #Err("Reentry process activated, please try again later")};
                reentrancyPrevent({cardPID = caller; reentrancyStatus = true});
                let bufferPositions = Buffer.fromArray<Position>(card.positions);
                let bufferRequestsEmployee = Buffer.fromArray<Position>([]);
                if(indexRequest > card.requestsEmployee.size()){return #Err("indexRequest out of range")};

                var i = 0;
                while (i < card.requestsEmployee.size()) {
                    if (i != indexRequest){
                        bufferRequestsEmployee.add(card.requestsEmployee[i]);
                    } else {
                        bufferPositions.add(card.requestsEmployee[i]);
                        i += 1;
                    };
                    i += 1;
                };
                let requestsEmployee = Buffer.toArray(bufferRequestsEmployee);
                ignore Map.put<Principal, Card>(
                    cards, 
                    phash, 
                    caller, 
                    {card with 
                        positions = Buffer.toArray(bufferPositions);
                        requestsEmployee});
                reentrancyPrevent({cardPID = caller; reentrancyStatus = false});
                #Ok(requestsEmployee);
            };
        };
    };

  ///////////////////////////////////// Setters Functions //////////////////////////////////////////////////////////
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
                    positions = if(card.visiblePositions) {card.positions} else {[]};
                    contactQty = Set.size(card.contacts);
                };
                #Ok(publicDataCard)
            }
        }
    };

    public shared ({ caller }) func setPositionVisibility(visiblePositions: Bool):async  Bool {
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { false };
            case (?card) {
                ignore Map.put<Principal, Card>(cards, phash, caller, {card with visiblePositions});
                true
            }
        }
    };

    public shared ({ caller }) func setVisibilityCard(visible: Bool): async {#Ok; #Err: Text} {
        if(not hasCard(caller)){
            return #Err("There is no user associated with the caller")
        };
        if(visible){
            Set.add(publicCards, phash, caller);
            return #Ok
        };
        ignore Set.remove(publicCards, phash, caller);
        #Ok
    };

    // public shared ({ caller }) func addCertificate(c: Certificate):async {#Ok; #Err} {
    //     let card = Map.get<Principal, Card>(cards, phash, caller);
    //     switch card {
    //         case null { #Err };
    //         case ( ?card ) {

    //         }
    //     }
    //     title: Text;
    //     url: ?Text;
    // };

  ///////////////////////////////////////// Getters ///////////////////////////////////////////
  
    public query ({ caller }) func whoAmI(): async Text{
        Principal.toText(caller);
    };

    public query ({ caller }) func getCardByPrincipal(p: Principal): async {#Ok: CompleteCardData; #Err: Text} {
        let pCard = Map.get<Principal, Card>(cards, phash, p);
        switch pCard {
            case null {#Err("There is no card associated with the principal provided")};
            case(?pCard) {
                let callerCard = Map.get<Principal, Card>(cards, phash, caller);
                switch callerCard {
                    case null {#Ok({ pCard with
                            contactQty = Set.size(pCard.contacts);
                            email = "***********************";
                            phone = 0;
                        })
                    };
                    case (?callerCard){
                        if(not Set.has<Principal>(pCard.contacts, phash, caller) and
                            not Set.has<Principal>(callerCard.contactRequests, phash, p) and
                            caller != p) { 
                            return #Ok({ pCard with
                                contactQty = Set.size(pCard.contacts);
                                email = "***********************";
                                phone = 0;
                            });
                        };
                        #Ok({
                            pCard with
                            contactQty = Set.size(pCard.contacts);
                            positions = if(pCard.visiblePositions) {pCard.positions} else {[]};
                        })
                    }
                } 
            }
        }
    };

    public shared query({ caller }) func getMyCard(): async {#Ok: CompleteCardData; #Err} {
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { #Err };
            case (?card){
                #Ok({
                    card with 
                    contactQty = Set.size(card.contacts);
                });
            }
        }
    };

    public shared query ({ caller }) func getContactRequests():async {#Ok: [Principal]; #Err: Text}{
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { #Err("There is no card associated with the caller")};
            case (?card){
                #Ok(Set.toArray<Principal>(card.contactRequests));
            }
        }
    };

    public shared query ({ caller }) func getMyContacts(): async [Principal] {
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { [] };
            case (?card){
                Set.toArray<Principal>(card.contacts);
            }
        }
    };

    public query func getPaginatePublicCards(page: Nat): async GetPublicCardsResult{
        if(Set.size<Principal>(publicCards) < page * 10){
            return #Err("Pagination index out of range")
        };
        let arrayCardsOwners = Set.toArray<Principal>(publicCards);
        let bufferPreviewCards = Buffer.fromArray<CardPreview>([]);
        var index = page * 10;
        while (index < arrayCardsOwners.size() and index < (page + 1) * 10){
            let card = Map.get<Principal, Card>(cards, phash, arrayCardsOwners[index]);
            switch card {
                case null {};
                case (?card) {
                    let currentCardPreview: CardPreview = {
                        card with
                        positions = if(card.visiblePositions){ card.positions } else {[]};
                        contactQty = Set.size(card.contacts);
                    };
                    bufferPreviewCards.add(currentCardPreview);
                }
            };
            index += 1;
        };
        let thereIsMore = arrayCardsOwners.size() > (page + 1) * 10;
        #Ok({cardsPreview = Buffer.toArray<CardPreview>(bufferPreviewCards); thereIsMore}) 
    };

    public query func getCompanyById(id: Nat): async {#Ok: Company; #Err: Text} {
        let company = Map.get<CompanyId, Company>(companies, nhash, id);
        switch company {
            case null {#Err("Invalid Company ID")};
            case(?company) {
                #Ok(company)
            }
        }
    };
  
  ///////////////////////////// Interaction functions between cards ///////////////////////////
    
    public shared ({ caller }) func shareCard(p: Principal):async  {#Ok; #Err: Text} {
        if(caller == p) {return #Err("You cannot share your card with yourself")};
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



};
