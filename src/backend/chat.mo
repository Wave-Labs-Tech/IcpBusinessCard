import Prim "mo:⛔";
import Map "mo:map/Map";
import { n32hash } "mo:map/Map";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import { now } "mo:base/Time";

shared ({ caller }) actor class ChatManager() = this {

    type ChatId = Nat32; //Hash concatenacion de principals ordenados de menor a mayor
    type StorageIndex = {
        canisterId: Principal;
        index: Nat
    };
    type MsgContent = {
        msg: Text;
        multimedia: ?StorageIndex;
    };
    public type Msg = MsgContent and {
        date: Int;
        from: Principal;     
    };

    type Chat = {
        users: [Principal];
        msgs: [Msg];
    };

    func getChatId(users: [Principal]): ChatId {
        var sortedPrincipalToText: Text = "";
        for(user in (Array.sort<Principal>(users, Principal.compare)).vals()){
            sortedPrincipalToText #= Principal.toText(user)
        };
        Text.hash(sortedPrincipalToText);
    };

    func callerIncluded(c: Principal, users: [Principal]): Bool{
        switch (Array.find<Principal>(users, func x = x== c)){
            case null { false};
            case _ { true }
        };
    };

    stable let CANISTER_MAIN = caller;
    stable let chats = Map.new<ChatId, Chat>();

    public shared ({ caller }) func putMsg(users: [Principal], msgContent: MsgContent ): async {#Ok; #Err}{ //El parametro users debe incluir al caller
        if( not callerIncluded(caller, users)) {return #Err};
        ///////////////////////////////////////////////////////
        
        let chatId = getChatId(users);
        let chat = Map.get<ChatId, Chat>(chats, n32hash, chatId);
        let msg: Msg = { 
            msgContent with
            date = now();
            from = caller;
        };
        switch chat {
            case null {
                ignore Map.put<ChatId, Chat>(chats, n32hash, chatId, {users; msgs = [msg]});
                #Ok
            };
            case (?chat) {
                let updateMsgs = Prim.Array_tabulate<Msg>(
                    chat.msgs.size() + 1,
                    func i = if(i == 0) { msg } else { chat.msgs[i-1] }
                );
                ignore Map.put<ChatId, Chat>(chats, n32hash, chatId, {chat with msgs = updateMsgs});
                #Ok
            }
        };
    };

    public shared ({ caller }) func readChat(id: ChatId): async {#Ok: Chat; #Err}{
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