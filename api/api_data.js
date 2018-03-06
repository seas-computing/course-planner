define({ "api": [
  {
    "type": "GET",
    "url": "/api/app/",
    "title": "",
    "name": "Get_App_Data",
    "group": "App",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "devMode",
            "description": "<p>CAS is running in dev mode</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "devBuild",
            "description": "<p>Express is running in dev mode</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "currentAcademicYear",
            "description": "<p>Current academic year in config.js</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response Body:",
          "content": "HTTP/1.1 200 OK\n{\n  devMode: true,\n  devBuild: true,\n  currentAcademicYear: 2018\n}",
          "type": "json"
        }
      ]
    },
    "permission": [
      {
        "name": "ReadOnly",
        "title": "Current user's accessLevel must be at least \"Read-Only\"",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "src/server/express/routes/api/app.js",
    "groupTitle": "App",
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "Error",
            "description": "<p>Generic error from express</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Express Error",
          "content": "HTTP1.1/500 Error\n{\n \"error\": \"Error message\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/app/authenticate",
    "title": "",
    "name": "HarvardKeyLogin",
    "group": "App",
    "success": {
      "fields": {
        "301 Redirect": [
          {
            "group": "301 Redirect",
            "type": "301",
            "optional": false,
            "field": "Redirects",
            "description": "<p>to Harvard Key Login</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server/express/routes/app/app.js",
    "groupTitle": "App"
  },
  {
    "type": "GET",
    "url": "/app/static/*",
    "title": "",
    "group": "App",
    "name": "StaticAssets",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "path",
            "description": "<p>requested asset</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "301 Redirect": [
          {
            "group": "301 Redirect",
            "type": "301",
            "optional": false,
            "field": "Redirect",
            "description": "<p>strips /app/ from the request to redirect to the top level</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server/express/routes/app/app.js",
    "groupTitle": "App"
  },
  {
    "type": "GET",
    "url": "app/logout",
    "title": "",
    "name": "UserLogout",
    "group": "App",
    "success": {
      "fields": {
        "301 Redirect": [
          {
            "group": "301 Redirect",
            "type": "301",
            "optional": false,
            "field": "Redirects",
            "description": "<p>to Harvard Key Logout</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/server/express/routes/app/app.js",
    "groupTitle": "App"
  },
  {
    "type": "POST",
    "url": "/api/users/new",
    "title": "",
    "name": "AddUser",
    "group": "User",
    "permission": [
      {
        "name": "Admin",
        "title": "Current user's accessLevel must be \"Admin\"",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "src/server/express/routes/api/users.js",
    "groupTitle": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>non-object mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>date user was last updated</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdAt",
            "description": "<p>date user was created</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "HUID",
            "description": "<p>8-digit Harvard ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User' email address</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "__v",
            "description": "<p>number of revisions to user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "accessLevel",
            "description": "<p>User permission level</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response Body",
          "content": "HTTP/1.1 200 OK\n{\n  _id: \"1a2b3c4d536f7a8b9c0d1a2\",\n  updatedAt: \"2018-03-01T20:22:38.730Z\",\n  createdAt: \"2018-03-01T20:19:36.592Z\",\n  HUID: \"88888888\",\n  firstName: \"Example\",\n  lastName: \"User\",\n  email: \"help@seas.harvard.edu\",\n  __v: 0,\n  accessLevel: \"Admin\",\n  id: \"1a2b3c4d536f7a8b9c0d1a2\",\n},",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "HUID",
            "description": "<p>8-digit Harvard ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User' email address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "accessLevel",
            "defaultValue": "Read-Only",
            "description": "<p>User permission level</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request Body",
          "content": "{\n  HUID: \"88888888\",\n  firstName: \"Example\",\n  lastName: \"User\",\n  email: \"help@seas.harvard.edu\",\n  accessLevel: \"Admin\",\n},",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "optional": false,
            "field": "UnauthorizedError",
            "description": "<p>User lacks permission</p>"
          }
        ],
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "Error",
            "description": "<p>Generic error from express</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Express Error",
          "content": "HTTP1.1/500 Error\n{\n \"error\": \"Error message\"\n}",
          "type": "json"
        },
        {
          "title": "Permission Error",
          "content": "HTTP1.1/401 Error\n{\n \"error\": \"Only Admin users can update\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/api/users/all",
    "title": "",
    "name": "AllUsers",
    "group": "User",
    "permission": [
      {
        "name": "Admin",
        "title": "Current user's accessLevel must be \"Admin\"",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "src/server/express/routes/api/users.js",
    "groupTitle": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>non-object mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>date user was last updated</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdAt",
            "description": "<p>date user was created</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "HUID",
            "description": "<p>8-digit Harvard ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User' email address</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "__v",
            "description": "<p>number of revisions to user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "accessLevel",
            "description": "<p>User permission level</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response Body",
          "content": "HTTP/1.1 200 OK\n{\n  _id: \"1a2b3c4d536f7a8b9c0d1a2\",\n  updatedAt: \"2018-03-01T20:22:38.730Z\",\n  createdAt: \"2018-03-01T20:19:36.592Z\",\n  HUID: \"88888888\",\n  firstName: \"Example\",\n  lastName: \"User\",\n  email: \"help@seas.harvard.edu\",\n  __v: 0,\n  accessLevel: \"Admin\",\n  id: \"1a2b3c4d536f7a8b9c0d1a2\",\n},",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "optional": false,
            "field": "UnauthorizedError",
            "description": "<p>User lacks permission</p>"
          }
        ],
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "Error",
            "description": "<p>Generic error from express</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Express Error",
          "content": "HTTP1.1/500 Error\n{\n \"error\": \"Error message\"\n}",
          "type": "json"
        },
        {
          "title": "Permission Error",
          "content": "HTTP1.1/401 Error\n{\n \"error\": \"Only Admin users can update\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "DELETE",
    "url": "/api/users/:userId",
    "title": "",
    "name": "DeleteOneUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>User's MongoId</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "Admin",
        "title": "Current user's accessLevel must be \"Admin\"",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "src/server/express/routes/api/users.js",
    "groupTitle": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>non-object mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>date user was last updated</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdAt",
            "description": "<p>date user was created</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "HUID",
            "description": "<p>8-digit Harvard ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User' email address</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "__v",
            "description": "<p>number of revisions to user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "accessLevel",
            "description": "<p>User permission level</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response Body",
          "content": "HTTP/1.1 200 OK\n{\n  _id: \"1a2b3c4d536f7a8b9c0d1a2\",\n  updatedAt: \"2018-03-01T20:22:38.730Z\",\n  createdAt: \"2018-03-01T20:19:36.592Z\",\n  HUID: \"88888888\",\n  firstName: \"Example\",\n  lastName: \"User\",\n  email: \"help@seas.harvard.edu\",\n  __v: 0,\n  accessLevel: \"Admin\",\n  id: \"1a2b3c4d536f7a8b9c0d1a2\",\n},",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "optional": false,
            "field": "UnauthorizedError",
            "description": "<p>User lacks permission</p>"
          }
        ],
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "Error",
            "description": "<p>Generic error from express</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Express Error",
          "content": "HTTP1.1/500 Error\n{\n \"error\": \"Error message\"\n}",
          "type": "json"
        },
        {
          "title": "Permission Error",
          "content": "HTTP1.1/401 Error\n{\n \"error\": \"Only Admin users can update\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/api/users/:userId",
    "title": "",
    "name": "GetOneUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>User's MongoId</p>"
          }
        ]
      }
    },
    "permission": [
      {
        "name": "Admin",
        "title": "Current user's accessLevel must be \"Admin\"",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "src/server/express/routes/api/users.js",
    "groupTitle": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>non-object mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>date user was last updated</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdAt",
            "description": "<p>date user was created</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "HUID",
            "description": "<p>8-digit Harvard ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User' email address</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "__v",
            "description": "<p>number of revisions to user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "accessLevel",
            "description": "<p>User permission level</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response Body",
          "content": "HTTP/1.1 200 OK\n{\n  _id: \"1a2b3c4d536f7a8b9c0d1a2\",\n  updatedAt: \"2018-03-01T20:22:38.730Z\",\n  createdAt: \"2018-03-01T20:19:36.592Z\",\n  HUID: \"88888888\",\n  firstName: \"Example\",\n  lastName: \"User\",\n  email: \"help@seas.harvard.edu\",\n  __v: 0,\n  accessLevel: \"Admin\",\n  id: \"1a2b3c4d536f7a8b9c0d1a2\",\n},",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "optional": false,
            "field": "UnauthorizedError",
            "description": "<p>User lacks permission</p>"
          }
        ],
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "Error",
            "description": "<p>Generic error from express</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Express Error",
          "content": "HTTP1.1/500 Error\n{\n \"error\": \"Error message\"\n}",
          "type": "json"
        },
        {
          "title": "Permission Error",
          "content": "HTTP1.1/401 Error\n{\n \"error\": \"Only Admin users can update\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/api/users/current",
    "title": "",
    "name": "GetUser",
    "group": "User",
    "permission": [
      {
        "name": "ReadOnly",
        "title": "Current user's accessLevel must be at least \"Read-Only\"",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "src/server/express/routes/api/users.js",
    "groupTitle": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>non-object mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>date user was last updated</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdAt",
            "description": "<p>date user was created</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "HUID",
            "description": "<p>8-digit Harvard ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User' email address</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "__v",
            "description": "<p>number of revisions to user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "accessLevel",
            "description": "<p>User permission level</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response Body",
          "content": "HTTP/1.1 200 OK\n{\n  _id: \"1a2b3c4d536f7a8b9c0d1a2\",\n  updatedAt: \"2018-03-01T20:22:38.730Z\",\n  createdAt: \"2018-03-01T20:19:36.592Z\",\n  HUID: \"88888888\",\n  firstName: \"Example\",\n  lastName: \"User\",\n  email: \"help@seas.harvard.edu\",\n  __v: 0,\n  accessLevel: \"Admin\",\n  id: \"1a2b3c4d536f7a8b9c0d1a2\",\n},",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "Error",
            "description": "<p>Generic error from express</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Express Error",
          "content": "HTTP1.1/500 Error\n{\n \"error\": \"Error message\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "PUT",
    "url": "/api/users/:userId",
    "title": "",
    "name": "UpdateOneUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>User's MongoId</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "HUID",
            "description": "<p>8-digit Harvard ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User' email address</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "accessLevel",
            "defaultValue": "Read-Only",
            "description": "<p>User permission level</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request Body",
          "content": "{\n  HUID: \"88888888\",\n  firstName: \"Example\",\n  lastName: \"User\",\n  email: \"help@seas.harvard.edu\",\n  accessLevel: \"Admin\",\n},",
          "type": "json"
        }
      ]
    },
    "permission": [
      {
        "name": "Admin",
        "title": "Current user's accessLevel must be \"Admin\"",
        "description": ""
      }
    ],
    "version": "0.0.0",
    "filename": "src/server/express/routes/api/users.js",
    "groupTitle": "User",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>non-object mongoID for user</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "updatedAt",
            "description": "<p>date user was last updated</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "createdAt",
            "description": "<p>date user was created</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "HUID",
            "description": "<p>8-digit Harvard ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>User's first name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>User's last name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User' email address</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "__v",
            "description": "<p>number of revisions to user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "accessLevel",
            "description": "<p>User permission level</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response Body",
          "content": "HTTP/1.1 200 OK\n{\n  _id: \"1a2b3c4d536f7a8b9c0d1a2\",\n  updatedAt: \"2018-03-01T20:22:38.730Z\",\n  createdAt: \"2018-03-01T20:19:36.592Z\",\n  HUID: \"88888888\",\n  firstName: \"Example\",\n  lastName: \"User\",\n  email: \"help@seas.harvard.edu\",\n  __v: 0,\n  accessLevel: \"Admin\",\n  id: \"1a2b3c4d536f7a8b9c0d1a2\",\n},",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "optional": false,
            "field": "UnauthorizedError",
            "description": "<p>User lacks permission</p>"
          }
        ],
        "500": [
          {
            "group": "500",
            "optional": false,
            "field": "Error",
            "description": "<p>Generic error from express</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Express Error",
          "content": "HTTP1.1/500 Error\n{\n \"error\": \"Error message\"\n}",
          "type": "json"
        },
        {
          "title": "Permission Error",
          "content": "HTTP1.1/401 Error\n{\n \"error\": \"Only Admin users can update\"\n}",
          "type": "json"
        }
      ]
    }
  }
] });
