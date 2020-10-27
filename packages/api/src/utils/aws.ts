const { v4: uuidv4 } = require("uuid");

var AWS = require("aws-sdk");

// if (process.env.ENVIRONMENT === "local") {
//   var credentials = new AWS.SharedIniFileCredentials({ profile: "stwoh2" });
//   AWS.config.credentials = credentials;
// }
AWS.config.update({ region: "us-east-1" });

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const DYNAMODB_TABLE: string = process.env.DYNAMODB_TABLE!;

export async function addOrUpdateTemplateRecord(
  _templateId: number,
  _addresses: string[],
  _root: string,
  _progress: object,
) {
  const timestamp = new Date().getTime();
  const tId = await getIdByTemplate(_templateId);
  // console.log(tId);
  // console.log(addresses);
  if (tId) {
    const params = {
      TableName: DYNAMODB_TABLE,
      Key: { id: tId },
      UpdateExpression:
        "set addresses = :v, root = :w, progress = :x, updatedAt = :y",
      ExpressionAttributeValues: {
        ":v": JSON.stringify(_addresses != [] ? _addresses.sort() : []),
        ":w": _root,
        ":x": JSON.stringify(_progress),
        ":y": timestamp,
      },
    };
    // console.log(params);
    dynamoDb.update(params, (error: any, result: any) => {
      if (error) {
        console.log(error);
      }
      // console.log(result);
      return result;
    });
  } else if (tId === null) {
    const params = {
      TableName: DYNAMODB_TABLE,
      Item: {
        id: uuidv4(),
        templateId: _templateId,
        addresses: JSON.stringify(_addresses),
        root: _root,
        progress: JSON.stringify(_root),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };
    // console.log(params);
    dynamoDb.put(params, (error: any, result: any) => {
      if (error) {
        console.log(error);
      }
      return result;
    });
  }
}

function getIdByTemplate(templateId: number) {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: DYNAMODB_TABLE,
      IndexName: "templateId-index",
      KeyConditionExpression: "templateId = :templateId",
      ExpressionAttributeValues: {
        ":templateId": templateId,
      },
    };
    // console.log(params);
    dynamoDb.query(params, (error: any, result: any) => {
      if (error) {
        console.log(error);
        reject();
      }
      if (result.Items.length > 0) {
        // console.log("returned: " + result.Items[0]["id"]);
        resolve(result.Items[0]["id"]);
      } else {
        resolve(null);
      }
    });
  });
}

export function getTemplate(
  templateId: number,
): Promise<{ addresses: string[]; root: string; progress: Object }> {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: DYNAMODB_TABLE,
      IndexName: "templateId-index",
      KeyConditionExpression: "templateId = :templateId",
      ExpressionAttributeValues: {
        ":templateId": templateId,
      },
    };
    dynamoDb.query(params, (error: any, result: any) => {
      if (error) {
        console.log(error);
        reject();
      }
      if (result.Items.length > 0) {
        const addresses = result.Items[0]["addresses"];
        resolve({
          addresses: [...JSON.parse(addresses)],
          root: result.Items[0]["root"],
          progress: result.Items[0]["progress"],
        });
      } else {
        resolve({
          addresses: [],
          root: "",
          progress: {},
        });
      }
    });
  });
}
