# review/serializers.py
from django.contrib.auth.models import Group, User
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from rest_framework.exceptions import ValidationError
from review.models import ReviewCycle, Metric


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class GroupUserSerializer(serializers.Serializer):
    user_ids = serializers.ListField(child=serializers.IntegerField())


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'password', 'email')
        extra_kwargs = {
            'password': {'required': True, 'allow_blank': False},
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError("E-mail already exists")
        return value

    def validate_password(self, raw_password):
        password = make_password(raw_password)
        return password

class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class GroupListSerializer(serializers.ModelSerializer):
    membersCount = serializers.IntegerField(source='user_set.count', read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'membersCount']


class ReviewCycleCreateSerializer(serializers.ModelSerializer):
    group_id = serializers.IntegerField(write_only=True)
    metric_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = ReviewCycle
        fields = ['name', 'group_id', 'start_date', 'end_date', 'metric_ids']

    def create(self, validated_data):
        group_id = validated_data.pop('group_id')
        metric_ids = validated_data.pop('metric_ids', [])

        group = Group.objects.get(id=group_id)
        review_cycle = ReviewCycle.objects.create(group=group, **validated_data)

        if metric_ids:
            review_cycle_metrics = Metric.objects.filter(id__in=metric_ids)
            for metric in review_cycle_metrics:
                metric.review_cycles.add(review_cycle)

        return review_cycle


class MetricSerializer(serializers.ModelSerializer):
    review_cycles = serializers.PrimaryKeyRelatedField(
        queryset=ReviewCycle.objects.all(), many=True, required=False
    )

    class Meta:
        model = Metric
        fields = ['id', 'name', 'description', 'review_cycles']


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'groups', 'is_staff')


class RatingEntrySerializer(serializers.Serializer):
    target_user = serializers.IntegerField()
    value = serializers.FloatField()


class MetricRatingsSerializer(serializers.Serializer):
    metric = serializers.IntegerField()
    values = RatingEntrySerializer(many=True)


class BulkReviewSubmitSerializer(serializers.Serializer):
    ratings = MetricRatingsSerializer(many=True)