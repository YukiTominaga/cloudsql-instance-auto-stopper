const {google} = require('googleapis');
const {Logging} = require('@google-cloud/logging');
const sqladmin = google.sqladmin("v1beta4");

const SQL_INSTANCE = process.env.SQL_INSTANCE;

exports.stopSqlInstance = async (event, context, callback) => {
  const logging = new Logging();
  const log = logging.log("stop-sql-instance");
  try {
    const result = await stopSqlInstance();
    const metadata = {
      serverity: "INFO",
      resource: {
        type: "global",
      },
    };
    const jsonEntry = log.entry(metadata, result);
    await log.write([jsonEntry]);
    callback();
  } catch (err) {
    const metadata = {
      serverity: "ERROR",
      resource: {
        type: "global",
      },
    };
    const jsonEntry = log.entry(metadata, err);
    await log.write([jsonEntry]);
    callback(err);
  }
}

async function stopSqlInstance() {
  const authClient = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/sqlservice.admin',
    ],
  });

  const projectId = await google.auth.getProjectId();

  const body = {
    settings: {
      activationPolicy: "NEVER",
    }
  };
  const result = await sqladmin.instances.patch({
    auth: authClient,
    instance: SQL_INSTANCE,
    project: projectId,
    requestBody: body,
  });
  return result.data;
}
