# 🔐 Multi-Tenant Notion OAuth Setup Guide

## Overview
This guide sets up **user-specific OAuth** where each user connects to their own Notion workspace, not a single shared workspace.

## How It Works
- ✅ **Each user** connects to their own Notion account
- ✅ **User-specific tokens** stored locally on their device
- ✅ **Individual workspaces** - no shared access
- ✅ **Privacy first** - users control their own data

## Step 1: Create Notion OAuth App

### 1.1 Access Notion Integrations
1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Sign in with your Notion account
3. Click "New integration"

### 1.2 Configure Integration Details
- **Name**: `SpeakToNote (Multi-Tenant)`
- **Associated workspace**: Select your workspace (this is just for the app registration)
- **Integration logo**: (Optional) Upload a logo

### 1.3 Set OAuth Capabilities
Enable these capabilities:
- ✅ **Read content**
- ✅ **Update content** 
- ✅ **Insert content**

### 1.4 Configure OAuth Settings
In the OAuth section:
- **Redirect URI**: `speaktonote://auth`
- **OAuth Scopes**: 
  - `read` - Read pages and databases
  - `write` - Create and update content

### 1.5 Save Integration
Click "Submit" to create your integration.

## Step 2: Get OAuth Credentials

After creating the integration, you'll see:

### 2.1 Client ID (Integration ID)
- Copy the **Integration ID** (this is your Client ID)
- It looks like: `12345678-1234-1234-1234-123456789abc`

### 2.2 Client Secret
- Copy the **Internal Integration Token**
- It starts with: `secret_...`
- This is your Client Secret for OAuth

## Step 3: Update App Configuration

### 3.1 Edit Configuration File
Open `src/config/notion.ts` and update:

```typescript
export const NOTION_CONFIG = {
  // Replace with your actual Client ID
  CLIENT_ID: '12345678-1234-1234-1234-123456789abc',
  
  // Replace with your actual Client Secret
  CLIENT_SECRET: 'secret_your_actual_secret_here',
  
  // Keep this as is
  REDIRECT_URI: 'speaktonote://auth',
  
  // Keep these as is
  AUTH_URL: 'https://api.notion.com/v1/oauth/authorize',
  TOKEN_URL: 'https://api.notion.com/v1/oauth/token',
  SCOPES: ['read', 'write'],
  
  // Multi-tenant settings
  MULTI_TENANT: true,
  USER_SPECIFIC_TOKENS: true,
};
```

## Step 4: How Multi-Tenant OAuth Works

### 4.1 User Flow
1. **User opens app** → No Notion connection yet
2. **User taps "Connect with OAuth"** → Browser opens
3. **User logs into their own Notion account** → Not your workspace!
4. **User authorizes the app** → Grants permissions to THEIR workspace
5. **App gets user-specific token** → Stored locally on their device
6. **User selects their page** → From their own workspace
7. **Notes sync to their workspace** → Not shared with anyone else

### 4.2 Privacy & Security
- ✅ **Each user's data** stays in their own Notion workspace
- ✅ **No shared access** between users
- ✅ **User-specific tokens** stored locally
- ✅ **No central database** of user data
- ✅ **User controls** their own permissions

## Step 5: Test Multi-Tenant OAuth

### 5.1 Start the App
```bash
cd SpeakToNote && npx expo start --clear
```

### 5.2 Test with Different Users
1. **User A**: Connect to their Notion workspace
2. **User B**: Connect to their different Notion workspace
3. **Verify**: Each user sees only their own pages
4. **Test sync**: Notes go to each user's own workspace

### 5.3 Expected Behavior
- **User A's notes** → Only appear in User A's Notion workspace
- **User B's notes** → Only appear in User B's Notion workspace
- **No cross-contamination** between users
- **Individual sync status** for each user

## Step 6: Troubleshooting

### Common Issues

#### Issue 1: "User sees wrong workspace"
**Solution**: 
- Each user must log into their own Notion account during OAuth
- Clear app data if testing with same device

#### Issue 2: "OAuth redirect issues"
**Solution**:
- Verify redirect URI: `speaktonote://auth`
- Check that each user completes the full OAuth flow

#### Issue 3: "Token sharing between users"
**Solution**:
- Tokens are stored locally per device
- Each user gets their own token
- No central token storage

### Debug Steps
1. **Check console logs** for user-specific information
2. **Verify user ID and workspace ID** are different for each user
3. **Test with different Notion accounts**
4. **Clear app data** between tests

## Step 7: Production Considerations

### 7.1 User Management
- **No user accounts** needed in your app
- **Notion handles** user authentication
- **Local storage** for user preferences

### 7.2 Data Privacy
- **No user data** stored on your servers
- **All data** stays in user's Notion workspace
- **GDPR compliant** by design

### 7.3 Scaling
- **No backend** needed for user management
- **Notion handles** user authentication
- **Stateless** app design

## Step 8: Advanced Features

### 8.1 Multiple Workspaces per User
- Users can connect to multiple Notion workspaces
- Switch between workspaces in the app
- Each workspace has its own pages

### 8.2 Workspace Switching
- Add UI to switch between connected workspaces
- Store multiple workspace configurations
- Allow users to manage multiple connections

### 8.3 Team Collaboration
- Users can share pages with team members
- Team members see shared pages in their workspace
- Maintain individual privacy

---

## 🎉 Success Checklist

- [ ] Notion OAuth app created
- [ ] Multi-tenant configuration set up
- [ ] User A connects to their workspace
- [ ] User B connects to different workspace
- [ ] Notes sync to correct workspaces
- [ ] No cross-contamination between users
- [ ] Privacy and security verified

## Key Benefits

✅ **True multi-tenancy** - Each user has their own workspace  
✅ **Privacy first** - No shared data between users  
✅ **No backend needed** - Notion handles authentication  
✅ **Scalable** - Works for any number of users  
✅ **User control** - Users manage their own permissions  

**You now have true multi-tenant Notion OAuth! 🚀**
