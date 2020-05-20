# Example for add a cloud function called main:

gcloud functions deploy main --trigger-http --runtime=nodejs10 --service-account=youngdi-940@denisarobot.iam.gserviceaccount.com

# Example for add a all role user to call the function called main:

gcloud functions add-iam-policy-binding main --member="allUsers" --role="roles/cloudfunctions.invoker"

# For MXSchool please use the cmd below:

### Deploy
gcloud functions deploy getMXSchoolCarousel --trigger-http --runtime=nodejs10 --service-account=youngdi-940@denisarobot.iam.gserviceaccount.com

### Add User
gcloud functions add-iam-policy-binding getMXSchoolCarousel --member="allUsers" --role="roles/cloudfunctions.invoker"

### remove all user auth
Go to auth on dashboard




