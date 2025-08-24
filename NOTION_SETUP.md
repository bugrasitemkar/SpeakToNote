# 🚀 Real Notion Integration Setup Guide

## Overview
This guide will help you set up real Notion OAuth integration for the SpeakToNote app.

## Prerequisites
- A Notion account
- Access to Notion's developer portal
- Basic understanding of OAuth flows

## Step 1: Create Notion Integration

### 1.1 Go to Notion Integrations
1. Visit [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"

### 1.2 Configure Integration
- **Name**: `SpeakToNote`
- **Associated workspace**: Select your workspace
- **Capabilities**:
  - ✅ Read content
  - ✅ Update content
  - ✅ Insert content

### 1.3 Get Integration Details
After creating, you'll get:
- **Internal Integration Token** (starts with `secret_`)
- **Integration ID** (for OAuth)

## Step 2: Configure OAuth (Optional)

### 2.1 OAuth Settings
If you want full OAuth flow:
1. In your integration settings, add:
   - **Redirect URI**: `speaktonote://auth`
   - **OAuth Scopes**: `read`, `write`

### 2.2 Update App Configuration
Update `src/services/notion.ts`:
```typescript
const NOTION_CLIENT_ID = 'your-integration-id-here';
```

## Step 3: Manual Token Setup (Recommended for Development)

### 3.1 Get Your Token
1. Copy your **Internal Integration Token** from the integration page
2. It looks like: `secret_abc123def456...`

### 3.2 Share a Page
1. Create a new page in Notion
2. Click "Share" → "Invite" → Search for your integration name
3. Give it "Edit" permissions
4. Copy the page ID from the URL

### 3.3 Update App Code
In `src/services/notion.ts`, update the manual token method:

```typescript
private async authenticateWithManualToken(): Promise<boolean> {
  try {
    // Replace with your real token and page ID
    const config: NotionConfig = {
      accessToken: 'secret_your_real_token_here',
      pageId: 'your_page_id_here',
      pageName: 'Your Page Name',
    };
    
    await this.saveConfig(config);
    return true;
  } catch (error) {
    console.error('Manual token authentication error:', error);
    return false;
  }
}
```

## Step 4: Test the Integration

### 4.1 Test Connection
1. Open the app
2. Tap the document icon (📄)
3. Tap "Connect to Notion"
4. Select your page from the list

### 4.2 Test Sync
1. Record a note
2. Check if it appears in your Notion page
3. Verify the sync status indicators

## Troubleshooting

### Common Issues

#### 1. "Notion not configured" Error
- Make sure you've set up the integration token
- Check that the page is shared with your integration

#### 2. "No pages found" Error
- Ensure your integration has access to pages
- Try creating a new page and sharing it

#### 3. OAuth Flow Issues
- Check redirect URI configuration
- Verify OAuth scopes are correct

### Debug Mode
Enable debug logging by checking the console output for:
- `✅ Note synced to Notion successfully!`
- `📄 Page: [Your Page Name]`
- `📝 Content: [Your Note Content]`

## Security Notes

### Token Security
- Never commit tokens to version control
- Use environment variables in production
- Rotate tokens regularly

### Permissions
- Only grant necessary permissions
- Review integration access periodically
- Remove unused integrations

## Production Deployment

### Environment Variables
Set these in your production environment:
```bash
NOTION_CLIENT_ID=your_client_id
NOTION_CLIENT_SECRET=your_client_secret
```

### OAuth Configuration
For production OAuth:
1. Update redirect URIs for your domain
2. Configure proper CORS settings
3. Implement token refresh logic

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your Notion integration settings
3. Ensure your page permissions are correct
4. Test with a simple page first

---

**Happy Notion syncing! 🎉**
