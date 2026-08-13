import mysql from 'mysql2/promise';

const DB_URL = 'mysql://3pXYBN7ALdP3R8i.root:BGnF8OX9e1BrMFV0iO77@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/Xa5WK2zgALVZPriP2m7kh2?ssl={"rejectUnauthorized":true}';

const tables = [
  'users','candidateProfiles','locations','skills','skillAliases',
  'candidateSkills','workExperiences','education','resumeSuggestions',
  'profileDrafts','companies','companyMembers','jobs','jobSkills',
  'applications','applicationStageEvents','profileViews','messages',
  'reports','savedSearches','notificationPreferences','unsubscribeTokens',
  'notifications','notificationQueue','emailSendLog','digestRuns','digestSent'
];

const conn = await mysql.createConnection(DB_URL);
console.log('SOURCE DATABASE RECORD COUNTS:');
for (const t of tables) {
  try {
    const [rows] = await conn.execute(`SELECT COUNT(*) as n FROM \`${t}\``);
    console.log(`  ${t}: ${rows[0].n}`);
  } catch(e) {
    console.log(`  ${t}: ERROR - ${e.message}`);
  }
}
await conn.end();
