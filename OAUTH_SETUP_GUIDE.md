# 🔐 Notion OAuth Setup Guide

## Overview
This guide will help you set up full OAuth integration with Notion for the SpeakToNote app.

## Prerequisites
- Notion account with admin access
- Basic understanding of OAuth flows
- Development environment ready

## Step 1: Create Notion OAuth Integration

### 1.1 Access Notion Integrations
1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Sign in with your Notion account
3. Click "New integration"

### 1.2 Configure Integration Details
- **Name**: `SpeakToNote OAuth`
- **Associated workspace**: Select your workspace
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
};
```

### 3.2 Security Note
⚠️ **Important**: Never commit your real credentials to version control!
- Add `src/config/notion.ts` to `.gitignore`
- Use environment variables in production

## Step 4: Test OAuth Flow

### 4.1 Start the App
```bash
cd SpeakToNote && npx expo start --clear
```

### 4.2 Test OAuth Connection
1. Open the app on your device
2. Tap the document icon (📄)
3. Tap "Connect with OAuth"
4. Complete the Notion authorization flow

### 4.3 Expected Flow
1. **Browser opens** with Notion authorization page
2. **You authorize** the app to access your workspace
3. **Redirect back** to the app with authorization code
4. **App exchanges** code for access token
5. **Success message** appears

## Step 5: Troubleshooting

### Common Issues

#### Issue 1: "Invalid redirect URI"
**Solution**: 
- Check that redirect URI in Notion matches exactly: `speaktonote://auth`
- No extra spaces or characters

#### Issue 2: "Invalid client credentials"
**Solution**:
- Verify Client ID and Client Secret are correct
- Check for extra spaces or typos
- Ensure credentials are from the right integration

#### Issue 3: "Authorization failed"
**Solution**:
- Check OAuth scopes are set correctly
- Ensure integration has proper permissions
- Try clearing app cache and retrying

#### Issue 4: "Token exchange failed"
**Solution**:
- Verify Client Secret is correct
- Check network connectivity
- Ensure authorization code is fresh

### Debug Steps
1. **Check console logs** for detailed error messages
2. **Verify credentials** in `src/config/notion.ts`
3. **Test with Postman** or curl to verify OAuth endpoints
4. **Check Notion integration** settings

## Step 6: Production Deployment

### 6.1 Environment Variables
For production, use environment variables:

```bash
# .env file
NOTION_CLIENT_ID=your_client_id
NOTION_CLIENT_SECRET=your_client_secret
```

### 6.2 Update Configuration
```typescript
export const NOTION_CONFIG = {
  CLIENT_ID: process.env.NOTION_CLIENT_ID || 'fallback_id',
  CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET || 'fallback_secret',
  // ... rest of config
};
```

### 6.3 Security Checklist
- ✅ Credentials not in version control
- ✅ Environment variables used
- ✅ HTTPS redirect URIs in production
- ✅ Proper error handling
- ✅ Token refresh logic implemented

## Step 7: Advanced Configuration

### 7.1 Custom Redirect URI
If you need a different redirect URI:
1. Update in Notion integration settings
2. Update `REDIRECT_URI` in config
3. Update `app.json` scheme if needed

### 7.2 Additional Scopes
If you need more permissions:
- Add scopes to Notion integration
- Update `SCOPES` array in config
- Re-authorize users

## Support

### Getting Help
1. **Check Notion API docs**: https://developers.notion.com/
2. **Review OAuth flow**: https://developers.notion.com/docs/authorization
3. **Console logs**: Look for detailed error messages
4. **Test endpoints**: Use Postman to verify API calls

### Common Error Codes
- `400`: Bad request (check parameters)
- `401`: Unauthorized (check credentials)
- `403`: Forbidden (check permissions)
- `404`: Not found (check URLs)

---

## 🎉 Success Checklist

- [ ] Notion integration created
- [ ] OAuth credentials obtained
- [ ] Configuration file updated
- [ ] OAuth flow tested successfully
- [ ] Notes syncing to Notion
- [ ] Error handling working
- [ ] Production security configured

**You're ready to use real Notion OAuth integration! 🚀**
