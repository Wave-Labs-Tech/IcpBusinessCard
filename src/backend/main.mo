import Types "types";
import Map "mo:map/Map";
import Set "mo:map/Set";
import { now } "mo:base/Time";
import { phash; nhash} "mo:map/Map";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Prim "mo:⛔";
import ChatManager "./chat/chat";

import { print } "mo:base/Debug";
import Array "mo:base/Array";

shared ({ caller }) actor class BusinessCard () = this {
  ////////////////////////////// Types declarations ///////////////////////////////////////////
  // Interactions
    type CompanyInit = Types.CompaniInit;
    type Company = Types.Company;
    type CompanyId = Nat;
    type Position = Types.Position;
    type CardDataInit = Types.CardDataInit;
    type Sector = Types.Sector;
    type Card = Types.Card;
    type CardPublicData = Types.CardPublicData;
    type CompleteCardData = Types.CompleteCardData;
    type UpdatableData = Types.UpdatableData;
    type Certificate = Types.Certificate;
    type Id = Nat;
    type CreateResult = { #Ok: Id; #Err: Text };
    type GetPublicCardsResult = {
        #Ok: {cardsPreview: [CardPreview]; hasMore: Bool};
        #Err: Text;
    };
    type CardPreview = Types.CardPreview;
    type Notification = Types.Notification;

  //////////////////////////// storage and utility variables //////////////////////////////////

    stable let companiesId = Map.new<Principal, CompanyId>();
    stable let companies = Map.new<CompanyId, Company>();
    stable let cards = Map.new<Principal, Card>();
    stable let admins = Set.new<Principal>();
    stable let publicCards = Set.new<Principal>();
    stable var lastCompanyId = 0;
    stable var updateLockTime: Int = 43_200_000_000_000; // 12 horas en nanosegundos;

    stable let notifications = Map.new<Principal, [Notification]>();

    public type ChatManager = ChatManager.ChatManager;

    stable var chatManager: ChatManager = actor("aaaaa-aa");
    // Inicializar chatManager
    public shared ({ caller }) func initChatManager(): async Principal{
        assert(Principal.isController(caller) and Principal.fromActor(chatManager) == Principal.fromText("aaaaa-aa"));
        Prim.cyclesAdd<system>(300_000_000_000);
        chatManager := await ChatManager.ChatManager();

        let userNamesBufferToSend = Buffer.Buffer<{p:Principal; name: Text}>(0);
        for( (p, card) in Map.entries<Principal, Card>(cards)){
            userNamesBufferToSend.add({p; name = card.name})
        };
        chatManager.updateUsers(Buffer.toArray(userNamesBufferToSend));
        Principal.fromActor(chatManager)
    };

  ////////////////// Only controllers ///////////////////////////////////////////
  // TODO BackUp
  public shared ({ caller }) func hardReset(code: Nat): async (){
    assert(Principal.isController(caller) and code == 8754987548745);
    Map.clear<Principal, Card>(cards);
    Set.clear<Principal>(publicCards);
    Map.clear<Principal, CompanyId>(companiesId);
    Map.clear<CompanyId, Company>(companies);
    lastCompanyId := 0;
    updateLockTime := 43_200_000_000_000;
  };

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

    func isAdmin(p: Principal): Bool {
        Set.has<Principal>(admins, phash, p) 
    };

    func safeCreateCard(init: CardDataInit, owner: Principal, creator: Principal): {#Ok: CompleteCardData; #Err: Text} {
        if(hasCard(owner)){ return #Err("The caller already has a card associated")};
        let newCard: Card = {
            init with
            bio = "";
            sector: [Sector] = [];
            owner;
            creator;
            lastModifiedDate = now();
            reentrancyStatus = false;
            contacts = Set.new<Principal>();
            contactRequests= Set.new<Principal>();
            requestsEmployee: [Position] = [];
            score = 0;
            reviews: [Text] = [];
            historyLog = [];
            visiblePositions = false;
            positions: [Position] = [];
            certificates: [Certificate] = [];
            emailVerified = false;
            phoneVerified = false;
            kyc = false;
        };
        ignore Map.put<Principal, Card>(cards, phash, owner, newCard);
        ignore Set.put<Principal>(publicCards, phash, owner);
        if(owner != creator){
            ignore Set.put<Principal>(newCard.contactRequests, phash, creator);
        };
        let publicData: CompleteCardData = { newCard with
            contactRequests = [];
            relationWithCaller = #Self;
            contactQty = 0;
        };
        #Ok(publicData);
    };

  ////////////////////////////////// Only admins //////////////////////////////////////////////

    public shared ({ caller }) func addAdmin(a: Principal): async Bool {
        assert(isAdmin(caller));
        ignore Set.put<Principal>(admins, phash, a);
        true
    };

    public shared ({ caller }) func deleteMyCard(): async {#Ok: CardPublicData; #Err: Text}{
        deleteCard(caller)
    };

    func deleteCard(user: Principal): {#Ok: CardPublicData; #Err: Text} {
        let card = Map.remove<Principal, Card>(cards, phash, user);
        ignore Set.remove<Principal>(publicCards, phash, user);
        ignore Map.remove<Principal, [Notification]>(notifications, phash, user);
        switch card {
            case null { #Err("User not have a Card") };
            case ( ?card ) { 
                let contactsUser = Set.toArray(card.contacts);
                for (contact in contactsUser.vals()){
                    let cttCard = Map.get<Principal, Card>(cards, phash, contact);
                    switch cttCard {
                        case ( ?cttCard ) {
                            let contactsCtt = cttCard.contacts;
                            Set.delete<Principal>(contactsCtt, phash, user);
                            ignore Map.put<Principal, Card>(cards, phash, contact, {cttCard with contacts = contactsCtt});
                            let contactRequestsCtt = cttCard.contactRequests;
                            Set.delete<Principal>(contactRequestsCtt, phash, user);
                            ignore Map.put<Principal, Card>(cards, phash, contact, {cttCard with contactRequests = contactRequestsCtt});
                        };
                        case _ { }
                    }
                };
                #Ok({card with relationWithCaller = #None; contactQty = Set.size(card.contacts)})
            }
        } 
    };

    public shared ({ caller }) func removeCardByPrincipal({user: Principal}): async {#Ok: CardPublicData; #Err: Text} {
        assert(isAdmin(caller));
        deleteCard(user)
    };
  
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

    public shared ({ caller }) func createCard(init: CardDataInit): async {#Ok: CompleteCardData; #Err: Text} {
        assert(not Principal.isAnonymous(caller));
        let result = safeCreateCard(init, caller, caller);
        switch result {
            case (#Ok(_)) { chatManager.addUser(caller, init.name) };
            case (_) {  }
        };
        result
    };


  /////////////////////////// Funciones exclusivas de perfiles de Empresa //////////////////////

    public shared ({ caller }) func createCardFor(init: CardDataInit, owner: Principal): async {#Ok: CompleteCardData; #Err: Text} {   
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
                                    relationWithCaller = #EmployedRequired;
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
                    relationWithCaller = #Self;
                    positions = if(card.visiblePositions) {card.positions} else {[]};
                    contactQty = Set.size(card.contacts);
                };
                #Ok(publicDataCard)
            }
        }
    };

    public shared ({ caller }) func changeEmail(email: Text): async {#Ok; #Err: Text}{
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { #Err("There is no card associated with the caller")};
            case ( ?card ){
                if(now() < card.lastModifiedDate + updateLockTime){
                    return #Err("The last update was very recent, you must wait");
                };
                ignore Map.put<Principal, Card>(cards, phash, caller, {card with email; emailVerified = false});
                #Ok
            }
        } 
    };

    public shared ({ caller }) func changePhone(phone: Nat): async {#Ok; #Err: Text}{
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { #Err("There is no card associated with the caller")};
            case ( ?card ){
                if(now() < card.lastModifiedDate + updateLockTime){
                    return #Err("The last update was very recent, you must wait");
                };
                ignore Map.put<Principal, Card>(cards, phash, caller, {card with phone; phoneVerified = false});
                #Ok
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

    public shared ({ caller }) func addCertificate(c: Certificate):async {#Ok; #Err} {
        let card = Map.get<Principal, Card>(cards, phash, caller);
        switch card {
            case null { #Err };
            case ( ?card ) {
                let certificates = Prim.Array_tabulate<Certificate>(
                   card.certificates.size() +1,
                   func x = if(x == 0){ c } else { card.certificates[x - 1]}
                );
                ignore Map.put<Principal, Card>(cards, phash, caller, {card with certificates});
                #Ok
            }
        }
    };

  ///////////////////////////////////////// Getters ///////////////////////////////////////////
  
    public query ({ caller }) func whoAmI(): async Text{
        Principal.toText(caller);
    };

    public query func getChatManagerCanisterId(): async Principal{
        Principal.fromActor(chatManager)
    };

    func getRelationshipAtoB(a: Principal, b: Principal): Types.Relation {
        let cardA = Map.get<Principal,Card>(cards, phash, a);
        switch cardA {
            case null { #None };
            case ( ?cardA ) {
                if (a == b ) { return #Self };
                let cardB = Map.get<Principal,Card>(cards, phash, b);
                switch cardB {
                    case null { #None };
                    case ( ?cardB ) {
                        if(Set.has<Principal>(cardA.contacts, phash, cardB.owner)) {
                            #Contact
                        } else if (Set.has<Principal>(cardA.contactRequests, phash, cardB.owner)) {
                            #ContactInvited
                        } else if (Set.has<Principal>(cardB.contactRequests, phash, cardA.owner)) {
                            #ContactRequester;
                        } else {
                            #None
                        }
                    }
                }
            }
        }
    };

    public query ({ caller }) func getCardByPrincipal(p: Principal): async {#Ok: CompleteCardData; #Err: Text} {
        let pCard = Map.get<Principal, Card>(cards, phash, p);
        switch pCard {
            case null {#Err("There is no card associated with the principal provided")};
            case(?pCard) {
                let callerCard = Map.get<Principal, Card>(cards, phash, caller);
                switch callerCard {
                    case null {#Ok({ pCard with
                            contactRequests = [];
                            relationWithCaller = #None;
                            contactQty = Set.size(pCard.contacts);
                            email = "Private access";
                            phone = 0;
                        })
                    };
                    case (?callerCard){
                        let relationWithCaller = getRelationshipAtoB(p, caller);
                        if(relationWithCaller == #Contact or 
                            relationWithCaller == #ContactInvited or 
                            relationWithCaller == #Self) { 
                            return #Ok({ pCard with
                                contactRequests = [];
                                relationWithCaller;
                                contactQty = Set.size(pCard.contacts);
                                email = "Private access";
                                phone = 0;
                            });
                        };
                        if(relationWithCaller == #Self) {
                            let recBuffer = Buffer.fromArray<{principal: Principal; name: Text}>([]);
                            for(r in Set.toArray(pCard.contactRequests).vals()){
                                switch(Map.get<Principal, Card>(cards, phash, r)) {
                                    case null {};
                                    case (?card) {
                                      recBuffer.add({principal = r; name = card.name})  
                                    }
                                }
                            };
                            return #Ok({ pCard with
                                contactRequests = Buffer.toArray(recBuffer);
                                relationWithCaller;
                                contactQty = Set.size(pCard.contacts);
                                email = "Private access";
                                phone = 0;
                            });
                        };

                        #Ok({
                            pCard with
                            contactRequests = [];
                            relationWithCaller;
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
                let recBuffer = Buffer.fromArray<{principal: Principal; name: Text}>([]);
                for(r in Set.toArray(card.contactRequests).vals()){
                    switch(Map.get<Principal, Card>(cards, phash, r)) {
                        case null {};
                        case (?cardRec) {
                            recBuffer.add({principal = r; name = cardRec.name})  
                        }
                    }
                };
                #Ok({
                    card with
                    contactRequests = Buffer.toArray(recBuffer);
                    relationWithCaller = #Self;
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

    // public shared query ({ caller }) func seeRelationship(p: Principal)

    public query func getPaginatePublicCards(page: Nat): async GetPublicCardsResult{
        let cardsPerPage = 16;
        if(Set.size<Principal>(publicCards) < page * cardsPerPage){
            return #Err("Pagination index out of range")
        };
        let arrayCardsOwners = Set.toArray<Principal>(publicCards);
        let bufferPreviewCards = Buffer.fromArray<CardPreview>([]);
        var index = page * cardsPerPage;
        while (index < arrayCardsOwners.size() and index < (page + 1) * cardsPerPage){
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
        let hasMore = arrayCardsOwners.size() > (page + 1) * cardsPerPage;
        #Ok({cardsPreview = Buffer.toArray<CardPreview>(bufferPreviewCards); hasMore}) 
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
  
  ////////////////////////////////////// Notifications ////////////////////////////////////////
    func pushNotification(n: Notification, to: Principal) {
        let notificationArray = Map.get<Principal, [Notification]>(notifications, phash, to);
        switch notificationArray{
            case null{
                let notificationArrayInit = [n];
                ignore Map.put<Principal, [Notification]>(notifications, phash, to, notificationArrayInit)
            };
            case (?notificationArray) {
                let notificationArrayUpdate = Prim.Array_tabulate<Notification>(
                    notificationArray.size() + 1,
                    func x = if( x == 0) { n } else {notificationArray[x-1]}
                );
                ignore Map.put<Principal, [Notification]>(notifications, phash, to, notificationArrayUpdate)
            }
        };  
    };

    public shared ({ caller }) func pushNotificationFromChatCanister(n: Notification, users: [Principal]): async {#Ok; #Err}{
        assert(caller == Principal.fromActor(chatManager));
        for (user in users.vals()){
            pushNotification(n, user);
        };
        #Ok
    };

    public shared query ({ caller }) func getMyNotifications(): async [Notification]{
        getNotificationsByPrincipal(caller)
    };

    func getNotificationsByPrincipal(p: Principal): [Notification] {
        switch (Map.get<Principal, [Notification]>(notifications, phash, p)){
            case null {[]};
            case (?notificArray) { notificArray }
        }
    };

    public shared ({ caller }) func removeNotification(date: Int): async (){
        let arrayNotifications = getNotificationsByPrincipal(caller);
        let updateNotific = Array.filter<Notification>(arrayNotifications, func n = n.date != date);
        ignore Map.put<Principal, [Notification]>(notifications, phash, caller, updateNotific)       
    };

  ///////////////////////////// Interaction functions between cards ///////////////////////////
    
    public shared ({ caller }) func shareCard(p: Principal):async  {#Ok: Types.Relation; #Err: Text} {
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

                            ///// Push Notification //////////
                            let notification: Notification = {
                                date = now();
                                kind = #ContactAccepted({principal = caller; name = callerCard.name})
                            };
                            pushNotification(notification, p);
                            /////////////////////////////////
                        } else {
                            ignore Set.put<Principal>(pCard.contactRequests, phash, caller);
                            ///// Push Notification //////////
                            let notification: Notification = {
                                date = now();
                                kind = #ContactRequest({principal = caller; name = callerCard.name})
                            };
                            pushNotification(notification, p);
                            /////////////////////////////////
                        };
                        return #Ok(getRelationshipAtoB(caller, p));     
                    }
                }
            }
        }
    };

    public shared ({ caller }) func disconnectCard(p: Principal): async {#Ok: Types.Relation; #Err: Text}{
        let cCard = Map.get<Principal, Card>(cards, phash, caller);
        switch cCard {
            case null {#Err("There is no card associated with the caller")};
            case ( ?cCard ){
                let pCard = Map.get<Principal, Card>(cards, phash, p);
                switch pCard {
                    case null {#Err("There is no card associated with the Principal provided")};
                    case ( ?pCard ) {
                        Set.delete<Principal>(pCard.contacts, phash, caller);
                        Set.delete<Principal>(cCard.contacts, phash, p);
                        #Ok(#None)
                    }
                }
            }
        }
    };
};
