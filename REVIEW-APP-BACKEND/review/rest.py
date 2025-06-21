import django_filters
from django.contrib.auth.models import Group, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import GroupSerializer, GroupUserSerializer, \
                         UserCreateSerializer, GroupListSerializer, \
                         ReviewCycleCreateSerializer, MetricSerializer, UserSerializer, BulkReviewSubmitSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import ReviewCycle, Metric, Rating, SubmissionStatus
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.views import TokenRefreshView
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics
from django.utils import timezone


class GroupListView(APIView):
    # permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(operation_summary="List all groups with users")
    def get(self, request):
        groups = Group.objects.all()
        serializer = GroupListSerializer(groups, many=True)
        return Response(serializer.data)


class GroupDetailView(APIView):
    # permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(operation_summary="Get group details with users by ID")
    def get(self, request, pk):
        try:
            group = Group.objects.get(pk=pk)
        except Group.DoesNotExist:
            return Response({"detail": "Group not found"}, status=404)
        serializer = GroupListSerializer(group)
        return Response(serializer.data)


class GroupCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_summary="Create a new group",
        request_body=GroupSerializer,
        responses={201: GroupSerializer}
    )
    def post(self, request):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class GroupDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(operation_summary="Delete group by ID", responses={204: 'No Content'})
    def delete(self, request, pk):
        try:
            group = Group.objects.get(pk=pk)
        except Group.DoesNotExist:
            return Response({"detail": "Group not found"}, status=404)
        group.delete()
        return Response(status=204)


class GroupUserUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_summary="Update users in a group",
        request_body=GroupUserSerializer,
        responses={200: openapi.Response('Users updated successfully')}
    )
    def patch(self, request, pk):
        try:
            group = Group.objects.get(pk=pk)
        except Group.DoesNotExist:
            return Response({"detail": "Group not found"}, status=404)

        serializer = GroupUserSerializer(data=request.data)
        if serializer.is_valid():
            user_ids = serializer.validated_data['user_ids']
            users = User.objects.filter(id__in=user_ids)
            group.user_set.set(users)
            return Response({"detail": "Users updated successfully"})
        return Response(serializer.errors, status=400)


class UserCreate(APIView):
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(request_body=UserCreateSerializer)
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)
        user = User()
        user.username = serializer.validated_data['username']
        user.first_name = serializer.validated_data['first_name']
        user.last_name = serializer.validated_data['last_name']
        user.email = serializer.validated_data['email']
        user.password = serializer.validated_data['password']
        try:
            user.save()
            return Response({"err": False, "detail": f"User '{user.username}' created successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:

            return Response({"err": True, "detail": f"User '{user.username}' failed to get created. Failed with error {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST)


class ReviewCycleCreateView(APIView):
    # permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        request_body=ReviewCycleCreateSerializer,
        responses={
            201: openapi.Response(
                description="Review cycle created",
                examples={
                    "application/json": {
                        "id": 1,
                        "name": "Sprint 1",
                        "group": "Backend Team",
                        "start_date": "2025-06-01",
                        "end_date": "2025-06-15"
                    }
                }
            ),
            400: "Validation error"
        }
    )
    def post(self, request):
        serializer = ReviewCycleCreateSerializer(data=request.data)
        if serializer.is_valid():
            review_cycle = serializer.save()
            return Response({
                "id": review_cycle.id,
                "name": review_cycle.name,
                "group": review_cycle.group.name,
                "start_date": review_cycle.start_date,
                "end_date": review_cycle.end_date
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewCycleListView(APIView):
    # permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter(
            name='group_id',
            type=openapi.TYPE_STRING,
            in_='query',
            required=False
        ),
    ])
    def get(self, request):
        group_id = request.query_params.get('group_id')
        user_groups = None
        if group_id:
            user_group = Group.objects.get(id=group_id)
            cycles = ReviewCycle.objects.filter(
                is_active=True,
                group=user_group,
            ).order_by('start_date')
        else:
            cycles = ReviewCycle.objects.filter(
                is_active=True
            ).order_by('start_date')

        data = [
            {
                "id": cycle.id,
                "name": cycle.name,
                "group_id": cycle.group.id,
                "group": cycle.group.name,
                "start_date": cycle.start_date,
                "end_date": cycle.end_date
            } for cycle in cycles
        ]
        return Response(data, status=status.HTTP_200_OK)


class ParticipantsAndMetricsView(APIView):
    # permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get users and metrics for a review cycle",
        responses={200: openapi.Response(description="Participants and metrics")}
    )
    def get(self, request, cycle_id):
        try:
            review_cycle = ReviewCycle.objects.get(id=cycle_id, is_active=True)
        except ReviewCycle.DoesNotExist:
            return Response({"detail": "Review cycle not found."}, status=status.HTTP_404_NOT_FOUND)

        if review_cycle.group not in request.user.groups.all():
            return Response({"detail": "Not allowed to access this review cycle."}, status=status.HTTP_403_FORBIDDEN)

        participants = User.objects.filter(groups=review_cycle.group).distinct()
        metrics = Metric.objects.all()

        return Response({
            "cycle_id": review_cycle.id,
            "cycle_name": review_cycle.name,
            "start_date": review_cycle.start_date,
            "end_date": review_cycle.end_date,
            "metrics": [{"id": m.id, "name": m.name} for m in metrics],
            "participants": [
                {
                    "id": u.id,
                    "username": u.username,
                    "is_self": (u.id == request.user.id)
                } for u in participants
            ]
        }, status=status.HTTP_200_OK)


class BulkRatingSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        request_body=BulkReviewSubmitSerializer,
        responses={201: "Submitted successfully", 400: "Validation failed"}
    )
    def post(self, request, review_cycle_id):
        # Check if review cycle exists and is active
        try:
            review_cycle = ReviewCycle.objects.get(id=review_cycle_id, is_active=True)
        except ReviewCycle.DoesNotExist:
            return Response({"detail": "Review cycle not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if this user already finalized submission
        if SubmissionStatus.objects.filter(user=request.user, review_cycle=review_cycle, finalized=True).exists():
            return Response({"detail": "You have already finalized your submission."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate incoming data
        serializer = BulkReviewSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data['ratings']

        # Get metrics linked to review cycle
        linked_metrics = set(review_cycle.metrics.values_list('id', flat=True))
        submitted_metrics = set(item['metric'] for item in data)

        if submitted_metrics != linked_metrics:
            missing = linked_metrics - submitted_metrics
            return Response({"detail": f"Missing ratings for metrics: {list(missing)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Get users in group (excluding self-review if not required)
        group_user_ids = set(User.objects.filter(groups=review_cycle.group).values_list('id', flat=True))

        # Track submitted ratings
        created_ratings = []

        for metric_block in data:
            metric_id = metric_block['metric']
            values = metric_block['values']

            # Validate metric existence
            if metric_id not in linked_metrics:
                return Response({"detail": f"Metric {metric_id} is not part of this review cycle."}, status=status.HTTP_400_BAD_REQUEST)

            target_users_in_payload = set(entry['target_user'] for entry in values)

            if target_users_in_payload != group_user_ids:
                missing_users = group_user_ids - target_users_in_payload
                return Response({"detail": f"Missing ratings for users: {list(missing_users)} for metric {metric_id}"}, status=status.HTTP_400_BAD_REQUEST)

            for entry in values:
                rating, _ = Rating.objects.update_or_create(
                    review_cycle=review_cycle,
                    target_user_id=entry['target_user'],
                    metric_id=metric_id,
                    is_self_review=(request.user.id == entry['target_user']),
                    defaults={'value': entry['value']}
                )
                created_ratings.append({
                    "target_user": rating.target_user.username,
                    "metric": rating.metric.name,
                    "value": rating.value,
                    "is_self_review": rating.is_self_review
                })

        # Mark as finalized
        SubmissionStatus.objects.update_or_create(
            user=request.user,
            review_cycle=review_cycle,
            defaults={"finalized": True, "finalized_at": timezone.now()}
        )

        return Response({
            "message": "Ratings submitted successfully",
            "submitted": created_ratings
        }, status=status.HTTP_201_CREATED)

class MetricCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(request_body=MetricSerializer, responses={201: MetricSerializer})
    def post(self, request):
        serializer = MetricSerializer(data=request.data)
        if serializer.is_valid():
            metric = serializer.save()
            return Response(MetricSerializer(metric).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MetricListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'review_cycle_id',
                openapi.IN_QUERY,
                description="Filter metrics by ReviewCycle ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={200: MetricSerializer(many=True)}
    )
    def get(self, request):
        review_cycle_id = request.query_params.get('review_cycle_id')

        metrics = Metric.objects.prefetch_related('review_cycles').all()

        if review_cycle_id:
            metrics = metrics.filter(review_cycles__id=review_cycle_id)

        serializer = MetricSerializer(metrics, many=True)
        return Response(serializer.data)


class SimpleAuthTokenView(APIView):
    permission_classes = []  # Allow anyone to try authentication

    @swagger_auto_schema(
        operation_summary="Get JWT Token",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["username", "password"],
            properties={
                "username": openapi.Schema(type=openapi.TYPE_STRING),
                "password": openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={200: openapi.Response("JWT Token returned", openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "access": openapi.Schema(type=openapi.TYPE_STRING),
                "refresh": openapi.Schema(type=openapi.TYPE_STRING)
            }
        ))}
    )
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"detail": "Missing username or password"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)


class CustomTokenRefreshView(TokenRefreshView):
    @swagger_auto_schema(
        operation_summary="Refresh JWT Token",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["refresh"],
            properties={
                "refresh": openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={200: openapi.Response("Access token", openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "access": openapi.Schema(type=openapi.TYPE_STRING),
            }
        ))}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


# class UserFilter(FilterSet):
#     group_id = django_filters.NumberFilter(field_name='groups__id',
#                                            lookup_expr='exact')
#     exclude_group_id = django_filters.NumberFilter(field_name='groups__id',
#                                                    lookup_expr='exact', exclude=True)

#     class Meta:
#         model = User
#         fields = []


class UserList(APIView):
    # permission_classes = [IsAuthenticated, IsAdminUser]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'group_id',
                openapi.IN_QUERY,
                description="Optional group ID to filter users",
                type=openapi.TYPE_INTEGER,
                required=False,
            )
        ]
    )
    def get(self, request):
        group_id = request.query_params.get("group_id")

        if group_id:
            users = User.objects.filter(groups__id=group_id).order_by("id")
        else:
            users = User.objects.all().order_by("id")

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class LogoutView(APIView):
    @swagger_auto_schema(
        operation_summary="Logout user (blacklist refresh token)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["refresh"],
            properties={
                "refresh": openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={200: "Successfully logged out", 400: "Invalid token"},
    )
    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response({"detail": "Missing refresh token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"detail": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)