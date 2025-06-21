# review/urls.py
from django.urls import path
from review import rest
urlpatterns = [
    path("auth/token/", rest.SimpleAuthTokenView.as_view(), name="get-auth-token"),
    path('token/refresh/', rest.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', rest.LogoutView.as_view(), name='logout'),

    path('groups/list/', rest.GroupListView.as_view()),
    path('groups/create/', rest.GroupCreateView.as_view()),
    path('groups/<int:pk>/', rest.GroupDetailView.as_view()),
    path('groups/<int:pk>/delete/', rest.GroupDeleteView.as_view()),
    path('groups/<int:pk>/users/', rest.GroupUserUpdateView.as_view()),

    path('review-cycle/create/', rest.ReviewCycleCreateView.as_view()),
    path('review-cycle/list/', rest.ReviewCycleListView.as_view()),
    path('review-cycle/participants/<int:cycle_id>/', rest.ParticipantsAndMetricsView.as_view()),


    path('ratings/bulk-submit/<int:review_cycle_id>/', rest.BulkRatingSubmitView.as_view()),

    path('metrics/create/', rest.MetricCreateView.as_view()),
    path('metrics/list/', rest.MetricListView.as_view()),

    path('users/list/', rest.UserList.as_view()),

]
