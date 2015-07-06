module.exports =
{
    "anonymous": {
        "permissions": [
            "view_public"
        ]
    }
    "member": {
        "permissions": [
            "add_to_board",
            "view_community"
        ],
        "inherits": ["anonymous"]
    },
    "moderator" : {
        "permissions": [
            "moderate"
        ],
        "inherits": ["anonymous","member"]
    },
    "admin" : {
        "permissions": [
            "edit_community"
        ],
        "inherits": ["anonymous","member","moderator"]
    },
    "super-admin" : {
        "permissions": [
            "act_as_user"
        ],
        "inherits": ["admin", "anonymous","member","moderator"]
    }
};