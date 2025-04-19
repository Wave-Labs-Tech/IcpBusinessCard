module {

    public type Reaction = {
        #Like;
        #Dislike;
        #Love;
        #Haha;
        #Sad;
        #Angry;
    };
    public type ChatNotification = {
        date: Int;
        kind: {
            #Msg: {nameSender: Text; sender: Principal; chatId: ChatId};
            #MsgReaction: {chatId: ChatId; msgIndex: Nat; reaction: Reaction};
        }
    };

    public type ChatId = Nat32; //Hash concatenacion de principals ordenados de menor a mayor
    public type StorageIndex = {
        canisterId : Principal;
        index : Nat;
    };
    public type MsgContent = {
        msg : Text;
        multimedia : ?StorageIndex;
    };
    public type Msg = MsgContent and {
        date : Int;
        from : Principal;
    };

    public type Chat = {
        users : [Principal];
        msgs : [Msg];
    };
};
