import Prim "mo:⛔";
import Map "mo:map/Map";
// import Set "mo:map/Set";
import { n32hash; phash } "mo:map/Map";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Types "types";
import GlobalTypes  "../types";
import { now } "mo:base/Time";

shared ({ caller }) actor class ChatManager() = this {

    type ChatId = Types.ChatId;
    type Chat = Types.Chat;
    type MsgContent = Types.MsgContent;
    type Msg = Types.Msg;
    type Notification = GlobalTypes.Notification;
  ////////////////////////// Variables generales ///////////////////////////////////

    // let users = Set.new<Principal>();
    let userNames = Map.new<Principal, Text>(); 
    stable let DEPLOYER = caller;
    stable let chats = Map.new<ChatId, Chat>();
    stable let CANISTER_MAIN = actor(Principal.toText(DEPLOYER)):  actor {
        pushNotificationFromChatCanister: shared (Notification, [Principal]) -> async {#Ok; #Err};
    };

  ////////////////////// Main canister comunications ///////////////////////////////
    
    public shared ({ caller }) func updateUsers(arr: [{p:Principal; name: Text}]) {
        assert (caller == DEPLOYER);
        for(i in arr.vals()){ ignore Map.put<Principal, Text>(userNames, phash, i.p, i.name) }
    };

    public shared ({ caller }) func addUser(u: Principal, name: Text) {
        assert (caller == DEPLOYER);
        // ignore Set.put<Principal>(users, phash, u);
        ignore Map.put<Principal, Text>(userNames, phash, u, name)
    };

    public shared ({ caller }) func removeUser(u: Principal) {
        assert (caller == DEPLOYER);
        // Set.delete<Principal>(users, phash, u);
        Map.delete<Principal, Text>(userNames, phash, u);
    };
    
    public shared ({ caller }) func iAmUser(): async Bool{
        // Set.has<Principal>(users, phash, caller);
        Map.has<Principal, Text>(userNames, phash, caller);
    };

  ///////////////////////////// Private functions //////////////////////////

    func isUser(p: Principal): Bool {
        // Set.has<Principal>(users, phash, p);
        Map.has<Principal, Text>(userNames, phash, p)
    };

    func getChatId(_users: [Principal], caller: Principal): ChatId {
        var sortedPrincipalToText: Text = "";
        let allPrincipals = Prim.Array_tabulate<Principal>(
            _users.size() + 1,
            func i = if(i == 0){caller} else {_users[i -1]}
        );
        for(user in (Array.sort<Principal>(allPrincipals, Principal.compare)).vals()){
            sortedPrincipalToText #= Principal.toText(user)
        };
        Text.hash(sortedPrincipalToText);
    };

    func callerIncluded(c: Principal, _users: [Principal]): Bool{
        switch (Array.find<Principal>(_users, func x = x== c)){
            case null { false};
            case _ { true }
        };
    };

  ///////////////////////////////////// Chat /////////////////////////////////

    public shared ({ caller }) func putMsg(_users: [Principal], msgContent: MsgContent ): async {#Ok: ChatId; #Err}{ //El parametro users debe incluir al caller
        // assert(isUser(caller));
        let user = Map.get<Principal, Text>(userNames, phash, caller);
        switch user {
            case null {#Err};
            case ( ?user ) {
                let chatId = getChatId(_users, caller);
                let chat = Map.get<ChatId, Chat>(chats, n32hash, chatId);
                let msg: Msg = { 
                    msgContent with
                    date = now();
                    from = caller;
                };
                switch chat {
                    case null {
                        
                        ignore Map.put<ChatId, Chat>(chats, n32hash, chatId, {users = _users; msgs = [msg]});
                    };
                    case (?chat) {
                        let updateMsgs = Prim.Array_tabulate<Msg>(
                            chat.msgs.size() + 1,
                            func i = if(i == 0) { msg } else { chat.msgs[i-1] }
                        ); 
                        ignore Map.put<ChatId, Chat>(chats, n32hash, chatId, {chat with msgs = updateMsgs}); 
                    }
                };
                
                // let notification: Notification = #Msg({
                //     nameSender = user;
                //     date = now();
                //     sender = caller;
                //     chatId;
                // });

                let notification = {
                    date = now();
                    kind = #Msg({
                      sender = caller;
                      nameSender = user;
                      chatId;} 
                    )
                };

                ignore await CANISTER_MAIN.pushNotificationFromChatCanister(notification, _users);
                #Ok(chatId)
            }
        };

        
    };

    public shared ({ caller }) func readChat(id: ChatId): async {#Ok: Chat; #Err}{
        assert(isUser(caller));
        let chat = Map.get<ChatId, Chat>(chats, n32hash, id);
        switch chat {
            case null { #Err };
            case ( ?chat ) {
                if (not callerIncluded(caller, chat.users)) { return #Err };
                #Ok(chat);
            }
        }
    };


}