var mongodb = require('./db')
   ,markdown = require('markdown').markdown;

function Post(name, title, post) {
  this.name = name;
  this.title = title;
  this.post = post;
}

module.exports = Post;

//�洢һƪ���¼��������Ϣ
Post.prototype.save = function(callback) {
  var date = new Date();
  //�洢����ʱ���ʽ�������Ժ���չ
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //Ҫ�������ݿ���ĵ�
var post = {
    name: this.name,
    time: time,
    title:this.title,
    post: this.post,
    comments: []
};
  //�����ݿ�
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //��ȡ posts ����
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //���ĵ����� posts ����
      collection.insert(post, {
        safe: true
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);//ʧ�ܣ����� err
        }
        callback(null);//���� err Ϊ null
      });
    });
  });
};

//��ȡ���¼��������Ϣ
Post.getAll = function(name, callback) {
  //�����ݿ�
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //��ȡ posts ����
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      //���� query �����ѯ����
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);//ʧ�ܣ����� err
        }
		//���� markdown Ϊ html
		docs.forEach(function (doc) {
		  doc.post = markdown.toHTML(doc.post);
		});
        callback(null, docs);//�ɹ�����������ʽ���ز�ѯ�Ľ��
      });
    });
  });
};

//��ȡһƪ����
Post.getOne = function(name, day, title, callback) {
  //�����ݿ�
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //��ȡ posts ����
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //�����û������������ڼ����������в�ѯ
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function (err, doc) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        //���� markdown Ϊ html
		if (doc) {
		  doc.post = markdown.toHTML(doc.post);
		  doc.comments.forEach(function (comment) {
			comment.content = markdown.toHTML(comment.content);
		  });
		}
        callback(null, doc);//���ز�ѯ��һƪ����
      });
    });
  });
};

//����ԭʼ��������ݣ�markdown ��ʽ��
Post.edit = function(name, day, title, callback) {
  //�����ݿ�
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //��ȡ posts ����
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //�����û������������ڼ����������в�ѯ
      collection.findOne({
        "name": name,
        "time.day": day,
        "title": title
      }, function (err, doc) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, doc);//���ز�ѯ��һƪ���£�markdown ��ʽ��
      });
    });
  });
};

	//����һƪ���¼��������Ϣ
	Post.update = function(name, day, title, post, callback) {
	  //�����ݿ�
	  mongodb.open(function (err, db) {
		if (err) {
		  return callback(err);
		}
		//��ȡ posts ����
		db.collection('posts', function (err, collection) {
		  if (err) {
			mongodb.close();
			return callback(err);
		  }
		  //������������
		  collection.update({
			"name": name,
			"time.day": day,
			"title": title
		  }, {
			$set: {post: post}
		  }, function (err) {
			mongodb.close();
			if (err) {
			  return callback(err);
			}
			callback(null);
		  });
		});
	  });
	};

	//ɾ��һƪ����
	Post.remove = function(name, day, title, callback) {
	  //�����ݿ�
	  mongodb.open(function (err, db) {
		if (err) {
		  return callback(err);
		}
		//��ȡ posts ����
		db.collection('posts', function (err, collection) {
		  if (err) {
			mongodb.close();
			return callback(err);
		  }
		  //�����û��������ںͱ�����Ҳ�ɾ��һƪ����
		  collection.remove({
			"name": name,
			"time.day": day,
			"title": title
		  }, {
			w: 1
		  }, function (err) {
			mongodb.close();
			if (err) {
			  return callback(err);
			}
			callback(null);
		  });
		});
	  });
	};