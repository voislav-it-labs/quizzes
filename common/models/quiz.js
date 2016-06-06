var app = require('../../server/server');

var async = require('async');

module.exports = function(Quiz) {
  Quiz.beforeRemote('create', function (ctx, modelInstance, next) {
    var quiz = ctx.req.body;
    var Question = app.models.Question;
    if(quiz.questions && quiz.questions.length > 0){
      async.eachSeries(quiz.questions, function(question, callback){
        question.courseId = quiz.courseId;

        if(!question.id){
          Question.create(question, function(err, saved){
            question.id = saved.id;

            return callback(err);
          });
        } else {
          Question.findById(question.id, function(err, existing){
            if(err){
              return callback(err);
            }

            existing.question = question.question;
            existing.answers = question.answers;
            existing.courseId = quiz.courseId;
            
            existing.save(function (err) {
              return callback(err);
            });
          });
        }
      }, function done() {
        next();
      });
    }else{
      next();
    }
  });
};
