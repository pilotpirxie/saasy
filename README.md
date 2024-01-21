# saasy

API starter for SaaS applications. Made with Node, TypeScript, Express and Postgres on the server side and React and Vite on the client side. 
Starter provides out of the box authentication, teams management and billing.

Every user can create a team and invite other users to join the team. Each team has a role assigned to each user.
Teams can be used to group users and manage projects. Subscriptions are assigned to teams. One-time payments are assigned to users.

Features:
* login, register, forgot password, reset password
* social login with Google, GitHub
* authentication with JWT
* SMTP email service
* teams management with roles
* invitations to teams
* project management
* built-in billing
* generic subscription and one-time payments with Paddle

### Feature status

| Feature                    	     | Server 	 | Design 	 | Client 	 |
|----------------------------------|----------|----------|----------|
| email login                	     | ✅      	 | ✅      	 | ✅      	 |
| email register             	     | ✅      	 | ✅      	 | 	        |
| email verification             	 | ✅      	 | 	        | 	        |
| forgot password            	     | ✅      	 | ✅      	 | 	        |
| reset password             	     | ✅      	 | ✅      	 | 	        |
| login with Google          	     | ✅      	 | ✅      	 | 	        |
| login with GitHub          	     | ✅      	 | ✅      	 | 	        |
| jwt and refresh tokens     	     | ✅      	 | ✅      	 | ✅      	 |
| account edit               	     | ✅      	 | 	        | 	        |
| profile edit               	     | ✅      	 | 	        | 	        |
| smtp emails                	     | ✅      	 | 	        | 	        |
| teams management           	     | ✅      	 | 	        | 	        |
| team roles                 	     | ✅      	 | 	        | 	        |
| invitations                	     | ✅      	 | 	        | 	        |
| project management         	     | 	        | 	        | 	        |
| listing products           	     | 	        | 	        | 	        |
| listing sub plans          	     | 	        | 	        | 	        |
| product checkout           	     | 	        | 	        | 	        |
| sub checkout               	     | 	        | 	        | 	        |
| paddle sub integration     	     | 	        | 	        | 	        |
| paddle product integration 	     | 	        | 	        | 	        |

### License
MIT