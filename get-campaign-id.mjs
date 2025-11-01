import 'dotenv/config';
import axios from 'axios';

const token = 'bvT2x_4mrq59ptSbpSYW9vIUsRmAHMiOxMMbXqxfGNo';

async function getCampaignId() {
  try {
    console.log('Fetching campaign data from Patreon...\n');
    
    const response = await axios.get(
      'https://www.patreon.com/api/oauth2/v2/campaigns',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const campaigns = response.data.data;
    
    if (campaigns && campaigns.length > 0) {
      console.log('✅ Found your campaign(s):\n');
      campaigns.forEach((campaign, index) => {
        console.log(`Campaign ${index + 1}:`);
        console.log(`  Campaign ID: ${campaign.id}`);
        console.log(`  Creation Name: ${campaign.attributes?.creation_name || 'N/A'}`);
        console.log(`  Patron Count: ${campaign.attributes?.patron_count || 0}`);
        console.log('');
      });
      
      console.log('📋 Add this to your .env file:');
      console.log(`PATREON_CAMPAIGN_ID=${campaigns[0].id}`);
    } else {
      console.log('❌ No campaigns found');
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('\n💡 The token might be expired. Click "Refresh Token" on the Patreon page and update the token in this script.');
  }
}

getCampaignId();
