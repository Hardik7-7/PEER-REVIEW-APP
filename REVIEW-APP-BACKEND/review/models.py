from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.contrib.auth.models import Group, User
from django.contrib import admin


class ReviewCycle(models.Model):
    name = models.CharField(max_length=100)  # e.g. Sprint 1, Milestone 3
    group = models.ForeignKey(Group, on_delete=models.CASCADE)  # link to Django group
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.group.name}"



class Metric(models.Model):
    name = models.CharField(max_length=100)  # e.g. "Code Quality", "Teamwork"
    description = models.TextField(blank=True, null=True)
    review_cycles = models.ManyToManyField('ReviewCycle', blank=True, related_name="metrics")


    def __str__(self):
        return self.name


class Rating(models.Model):
    review_cycle = models.ForeignKey(ReviewCycle, on_delete=models.CASCADE)
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_ratings')
    metric = models.ForeignKey(Metric, on_delete=models.CASCADE)
    value = models.IntegerField()
    is_self_review = models.BooleanField(default=False)  # New field to mark self-review
    # No reviewer field here, to keep anonymous

    class Meta:
        indexes = [
            models.Index(fields=['review_cycle', 'target_user', 'metric']),
        ]

    def __str__(self):
        kind = "Self" if self.is_self_review else "Peer"
        return f"{kind} rating {self.value} for {self.target_user.username} in {self.review_cycle.name}"


class WeaknessNote(models.Model):
    review_cycle = models.ForeignKey(ReviewCycle, on_delete=models.CASCADE)
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weakness_notes')
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # No reviewer field here either, anonymous

    def __str__(self):
        return f"Weakness note for {self.target_user.username} in {self.review_cycle.name}"


class SubmissionStatus(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    review_cycle = models.ForeignKey(ReviewCycle, on_delete=models.CASCADE)
    finalized = models.BooleanField(default=False)
    finalized_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'review_cycle')

    def __str__(self):
        return f"{self.user.username} finalized {self.finalized} in {self.review_cycle.name}"


admin.site.register(ReviewCycle)
admin.site.register(Metric)
admin.site.register(SubmissionStatus)
admin.site.register(WeaknessNote)
admin.site.register(Rating)
