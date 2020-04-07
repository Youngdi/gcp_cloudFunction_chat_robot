gcloud functions deploy main --trigger-http --runtime=nodejs10 --service-account=youngdi-940@denisarobot.iam.gserviceaccount.com


gcloud functions add-iam-policy-binding main --member="allUsers" --role="roles/cloudfunctions.invoker"


gcloud functions deploy main --trigger-http --runtime=nodejs10 --service-account=youngdi-940@denisarobot.iam.gserviceaccount.com
